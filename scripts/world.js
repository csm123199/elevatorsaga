import { random, randomRange } from './base.js';
import { User } from './user.js';
import { Floor } from './floor.js';
import { Elevator } from './elevator.js';
import { ObservableClass } from './movable.js';
import { ElevatorInterface } from './interfaces.js';
export class WorldCreator {
    createFloors(floorCount, floorHeight, errorHandler) {
        return new Array(floorCount).fill(undefined).map((_, i) => {
            const yPos = (floorCount - 1 - i) * floorHeight;
            return new Floor(i, yPos, errorHandler);
        });
    }
    createElevators(elevatorCount, floorCount, floorHeight, elevatorCapacities = [4]) {
        let currentX = 200.0;
        const elevators = new Array(elevatorCount).fill(undefined).map((_, i) => {
            const elevator = new Elevator(2.6, floorCount, floorHeight, elevatorCapacities[i % elevatorCapacities.length]);
            // Move to right x position
            elevator.moveTo(currentX, null);
            elevator.setFloorPosition(0);
            elevator.updateDisplayPosition();
            currentX += (20 + elevator.width);
            return elevator;
        });
        return elevators;
    }
    createRandomUser(spawnTime) {
        let weight = randomRange(55, 100);
        let displayType;
        if (random(40) === 0) { // Math.floor(Math.random()*5) === 0
            displayType = "child";
        }
        else {
            // Math.round(Math.random()) === 0
            displayType = random(1) === 0 ? "female" : "male";
        }
        return new User(weight, displayType, spawnTime);
    }
    spawnUserRandomly(spawnTime, floorCount, floorHeight, floors) {
        let user = this.createRandomUser(spawnTime);
        user.moveTo(105 + random(40), 0);
        let currentFloor = random(1) === 0 ? 0 : random(floorCount, false);
        let destinationFloor;
        if (currentFloor === 0) {
            // Definitely going up
            destinationFloor = randomRange(1, floorCount - 1);
        }
        else {
            // Usually going down, but sometimes not
            if (random(10) === 0) {
                destinationFloor = (currentFloor + randomRange(1, floorCount, false)) % floorCount;
            }
            else {
                destinationFloor = 0;
            }
        }
        user.appearOnFloor(floors[currentFloor], destinationFloor);
        return user;
    }
    createWorld(options) {
        return new World(this, options);
    }
}
const defaultWorldOptions = {
    floorHeight: 50,
    floorCount: 4,
    elevatorCount: 2,
    spawnRate: 0.5
};
export class World extends ObservableClass {
    constructor(creator, options) {
        super();
        this.users = [];
        this.transportedCounter = 0;
        this.transportedPerSec = 0.0;
        this.moveCount = 0;
        this.elapsedTime = 0.0;
        this.maxWaitTime = 0.0;
        this.avgWaitTime = 0.0;
        this.challengeEnded = false;
        this.elapsedSinceStatsUpdate = 0.0;
        this.handleUserCodeError = (e) => {
            this.trigger("usercode_error", e);
        };
        this.handleElevAvailability = (elevator) => {
            // Use regular loops for memory/performance reasons
            // Notify floors first because overflowing users
            // will press buttons again.
            for (let floor of this.floors) {
                if (elevator.currentFloor === floor.level)
                    floor.elevatorAvailable(elevator);
            }
            for (let user of this.users) { // ensure count is accurate?
                if (user.currentFloor === elevator.currentFloor) {
                    user.elevatorAvailable(elevator, this.floors[elevator.currentFloor]);
                }
            }
        };
        this.handleButtonRepressing = (eventName, floor) => {
            // Need randomize iteration order or we'll tend to fill upp first elevator
            let offset = random(this.elevators.length - 1);
            for (let i = 0; i < this.elevators.length; i++) {
                let ei = (i + offset) % this.elevators.length;
                let elevator = this.elevators[ei];
                if (eventName === "up_button_pressed" && elevator.goingUpIndicator ||
                    eventName === "down_button_pressed" && elevator.goingDownIndicator) {
                    // Elevator is heading in correct direction, check for suitability
                    if (elevator.currentFloor === floor.level && elevator.isOnAFloor() && !elevator.isMoving && !elevator.isFull()) {
                        // Potentially suitable to get into
                        // Use the interface queue functionality to queue up this action
                        this.elevatorInterfaces[ei].goToFloor(floor.level, true);
                        return;
                    }
                }
            }
        };
        console.log("Creating world with options", options);
        const { floorHeight, // Only needed to create floors
        floorCount, // Only needed to create floors
        elevatorCount, // Only needed to create elevators
        spawnRate, elevatorCapacities, } = options !== undefined ? { ...options, ...defaultWorldOptions } : defaultWorldOptions;
        this.creator = creator;
        this.floorHeight = floorHeight;
        this.spawnRate = spawnRate;
        this.elapsedSinceSpawn = 1.001 / spawnRate; // Initial value
        this.floors = creator.createFloors(floorCount, this.floorHeight, this.handleUserCodeError);
        this.elevators = creator.createElevators(elevatorCount, floorCount, this.floorHeight, elevatorCapacities);
        this.elevatorInterfaces = this.elevators.map(e => new ElevatorInterface(e, floorCount, this.handleUserCodeError));
        // Bind them all together
        this.elevators.forEach(elevator => elevator.on("entrance_available", this.handleElevAvailability));
        // This will cause elevators to "re-arrive" at floors if someone presses an
        // appropriate button on the floor before the elevator has left.
        this.floors.forEach(floors => floors.on("up_button_pressed down_button_pressed", this.handleButtonRepressing));
    }
    recalculateStats() {
        this.transportedPerSec = this.transportedCounter / this.elapsedTime;
        this.moveCount = this.elevators.reduce((acc, el) => acc + el.moveCount, 0);
        this.trigger("stats_changed");
    }
    registerUser(user) {
        this.users.push(user);
        user.updateDisplayPosition(true);
        //user.spawnTimestamp = this.elapsedTime;
        // Move variable to local closure so it's not hacked into the user object
        //const userSpawnTimestamp = this.elapsedTime;
        this.trigger("new_user", user);
        user.on("exited_elevator", () => {
            this.transportedCounter++;
            this.maxWaitTime = Math.max(this.maxWaitTime, this.elapsedTime - user.spawnTimestamp);
            this.avgWaitTime = (this.avgWaitTime * (this.transportedCounter - 1) + (this.elapsedTime - user.spawnTimestamp)) / this.transportedCounter;
            this.recalculateStats();
        });
        user.updateDisplayPosition(true);
    }
    // Main update function
    update(dt) {
        this.elapsedTime += dt;
        this.elapsedSinceSpawn += dt;
        this.elapsedSinceStatsUpdate += dt;
        while (this.elapsedSinceSpawn > 1.0 / this.spawnRate) {
            this.elapsedSinceSpawn -= 1.0 / this.spawnRate;
            this.registerUser(this.creator.spawnUserRandomly(this.elapsedTime, this.floors.length, this.floorHeight, this.floors));
        }
        // Use regular for loops for performance and memory friendlyness
        for (let e of this.elevators) {
            e.update(dt);
            e.updateElevatorMovement(dt);
        }
        for (let u of this.users) {
            u.update(dt);
            this.maxWaitTime = Math.max(this.maxWaitTime, this.elapsedTime - u.spawnTimestamp);
        }
        this.users = this.users.filter(u => !u.removeMe);
        this.recalculateStats();
    }
    updateDisplayPositions() {
        for (let elevator of this.elevators) {
            elevator.updateDisplayPosition();
        }
        for (let user of this.users) {
            user.updateDisplayPosition();
        }
    }
    unWind() {
        console.log("Unwinding", this);
        [
            this.elevators,
            this.elevatorInterfaces,
            this.users,
            this.floors,
            [this]
        ].flat().forEach(obj => obj.off('*'));
        this.challengeEnded = true;
        this.elevators = this.elevatorInterfaces = this.users = this.floors = [];
    }
    init() {
        // Checking the floor queue of the elevators triggers the idle event here
        for (let elevInter of this.elevatorInterfaces) {
            elevInter.checkDestinationQueue();
        }
    }
}
// visual break
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export class WorldController extends ObservableClass {
    constructor(dtMax) {
        super();
        this.handleUserCodeError = (e) => {
            this.setPaused(true);
            console.log("Usercode error on update", e);
            this.trigger("usercode_error", e);
        };
        this.dtMax = dtMax;
        this.timeScale = 1.0;
        this.isPaused = true;
    }
    start(world, codeObj, animationFrameRequester, autoStart) {
        this.isPaused = true;
        let lastT = null;
        let firstUpdate = true;
        world.on("usercode_error", this.handleUserCodeError);
        let updater = (t) => {
            if (!this.isPaused && !world.challengeEnded && lastT !== null) {
                if (firstUpdate) {
                    firstUpdate = false;
                    // This logic prevents infite loops in usercode from breaking the page permanently - don't evaluate user code until game is unpaused.
                    try {
                        codeObj.init(world.elevatorInterfaces, world.floors);
                        world.init();
                    }
                    catch (e) {
                        this.handleUserCodeError(e);
                    }
                }
                var dt = (t - lastT);
                var scaledDt = dt * 0.001 * this.timeScale;
                scaledDt = Math.min(scaledDt, this.dtMax * 3 * this.timeScale); // Limit to prevent unhealthy substepping
                try {
                    codeObj.update(scaledDt, world.elevatorInterfaces, world.floors);
                }
                catch (e) {
                    this.handleUserCodeError(e);
                }
                while (scaledDt > 0.0 && !world.challengeEnded) {
                    var thisDt = Math.min(this.dtMax, scaledDt);
                    world.update(thisDt);
                    scaledDt -= this.dtMax;
                }
                world.updateDisplayPositions();
                world.trigger("stats_display_changed"); // TODO: Trigger less often for performance reasons etc
            }
            lastT = t;
            if (!world.challengeEnded) {
                animationFrameRequester(updater);
            }
        };
        if (autoStart) {
            this.setPaused(false);
        }
        animationFrameRequester(updater);
    }
    setPaused(paused) {
        this.isPaused = paused;
        this.trigger("timescale_changed");
    }
    setTimeScale(timeScale) {
        this.timeScale = timeScale;
        this.trigger("timescale_changed");
    }
}
//# sourceMappingURL=world.js.map