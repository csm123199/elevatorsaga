

import { UserCodeObject, random, randomRange } from './base.js'
import { User, UserDisplayType } from './user.js'
import { Floor } from './floor.js'
import { Elevator } from './elevator.js'
import { ObservableClass } from './movable.js';
import { ElevatorInterface } from './interfaces.js'

export class WorldCreator {
	createFloors(floorCount: number, floorHeight: number, errorHandler: (e: any) => void): Floor[] {
		return new Array(floorCount).fill(undefined).map((_, i) => {
			const yPos = (floorCount - 1 - i) * floorHeight;
			return new Floor(i, yPos, errorHandler);
		});
	}
	createElevators(elevatorCount: number, floorCount: number, floorHeight: number, elevatorCapacities: number[] = [4]) {
		let currentX = 200.0;
		const elevators = new Array(elevatorCount).fill(undefined).map((_, i) => {
			const elevator = new Elevator(2.6, floorCount, floorHeight, elevatorCapacities[i % elevatorCapacities.length]);

			// Move to right x position
			elevator.moveTo(currentX, null);
			elevator.setFloorPosition(0);
			elevator.updateDisplayPosition();
			currentX += (20 + elevator.width);
			return elevator;
		})
		return elevators;
	}
	createRandomUser(spawnTime: number): User {
		let weight = randomRange(55, 100);
		let displayType: UserDisplayType;
		if(random(40) === 0) { // Math.floor(Math.random()*5) === 0
			displayType = "child";
		} else {
			// Math.round(Math.random()) === 0
			displayType = random(1) === 0 ? "female" : "male"
		}
		return new User(weight, displayType, spawnTime);
	}
	spawnUserRandomly(spawnTime: number, floorCount: number, floorHeight: number, floors: Floor[]): User {
		let user = this.createRandomUser(spawnTime);
		user.moveTo(105+ random(40), 0);
		let currentFloor = random(1) === 0 ? 0 : random(floorCount, false);
		let destinationFloor;
		if(currentFloor === 0) {
			// Definitely going up
			destinationFloor = randomRange(1, floorCount - 1);
		} else {
			// Usually going down, but sometimes not
			if(random(10) === 0) {
				destinationFloor = (currentFloor + randomRange(1, floorCount, false)) % floorCount;
			} else {
				destinationFloor = 0;
			}
		}
		user.appearOnFloor(floors[currentFloor], destinationFloor);
		return user;
	}

	createWorld(options?: Partial<WorldOptions>) {
		return new World(this, options);
	}
}

export interface WorldOptions {
	readonly floorHeight: number;
	readonly floorCount: number;
	readonly elevatorCount: number;
	readonly spawnRate: number;
	readonly elevatorCapacities?: number[];
}
const defaultWorldOptions: WorldOptions = {
	floorHeight: 50,
	floorCount: 4,
	elevatorCount: 2,
	spawnRate: 0.5
}
export class World extends ObservableClass {
	readonly creator: WorldCreator;
	readonly floorHeight: number;
	readonly spawnRate: number;

	floors: Floor[];
	elevators: Elevator[];
	elevatorInterfaces: any;
	users: User[] = [];
	transportedCounter: number = 0;
	transportedPerSec: number = 0.0;
	moveCount: number = 0;
	elapsedTime: number = 0.0;
	maxWaitTime: number = 0.0;
	avgWaitTime: number = 0.0;
	challengeEnded: boolean = false;

	elapsedSinceStatsUpdate: number = 0.0;
	elapsedSinceSpawn: number;
	

	constructor(creator: WorldCreator, options?: Partial<WorldOptions>) {
		super();
		console.log("Creating world with options", options);

		const {
			floorHeight, // Only needed to create floors
			floorCount, // Only needed to create floors
			elevatorCount, // Only needed to create elevators
			spawnRate,
			elevatorCapacities, // Only needed to create elevators
		} = options !== undefined ? { ...options, ...defaultWorldOptions } : defaultWorldOptions;
		
		this.creator = creator;
		this.floorHeight = floorHeight;
		this.spawnRate = spawnRate;
		this.elapsedSinceSpawn = 1.001/spawnRate; // Initial value

		this.floors = creator.createFloors(
			floorCount,
			this.floorHeight,
			this.handleUserCodeError
		);
		this.elevators = creator.createElevators(
			elevatorCount,
			floorCount,
			this.floorHeight,
			elevatorCapacities
		);
		this.elevatorInterfaces = this.elevators.map(e =>
			new ElevatorInterface(e, floorCount, this.handleUserCodeError)
		)

		// Bind them all together
		this.elevators.forEach(elevator =>
			elevator.on("entrance_available", this.handleElevAvailability)
		);

		// This will cause elevators to "re-arrive" at floors if someone presses an
		// appropriate button on the floor before the elevator has left.
		this.floors.forEach(floors => 
			floors.on("up_button_pressed down_button_pressed", this.handleButtonRepressing)
		);

	}

	handleUserCodeError = (e: any) => {
		this.trigger("usercode_error", e);
	}

	recalculateStats() {
		this.transportedPerSec = this.transportedCounter / this.elapsedTime;
		this.moveCount = this.elevators.reduce((acc, el) => acc+el.moveCount, 0);

		this.trigger("stats_changed");
	}

	registerUser(user: User): void {
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
	handleElevAvailability = (elevator: Elevator): void => { // do some sort of array.filter.forEach ?? (or just break for flor, but forEach on uses for sure)
		// Use regular loops for memory/performance reasons
		// Notify floors first because overflowing users
		// will press buttons again.
		for(let floor of this.floors) {
			if(elevator.currentFloor === floor.level)
				floor.elevatorAvailable(elevator);
		}
		for(let user of this.users) { // ensure count is accurate?
			if(user.currentFloor === elevator.currentFloor) {
				user.elevatorAvailable(elevator, this.floors[elevator.currentFloor])
			}
		}
	}

	handleButtonRepressing = (eventName: string, floor: Floor): void => {
		// Need randomize iteration order or we'll tend to fill upp first elevator
		let offset = random(this.elevators.length - 1);

		for(let i = 0; i < this.elevators.length; i++) {
			let ei = (i + offset) % this.elevators.length;
			let elevator = this.elevators[ei];

			if( eventName === "up_button_pressed" && elevator.goingUpIndicator ||
				eventName === "down_button_pressed" && elevator.goingDownIndicator) {

				// Elevator is heading in correct direction, check for suitability
				if(elevator.currentFloor === floor.level && elevator.isOnAFloor() && !elevator.isMoving && !elevator.isFull()) {
					// Potentially suitable to get into
					// Use the interface queue functionality to queue up this action
					this.elevatorInterfaces[ei].goToFloor(floor.level, true);
					return;
				}
			}
		}
	}

	// Main update function
	update(dt: number) {
		this.elapsedTime += dt;
		this.elapsedSinceSpawn += dt;
		this.elapsedSinceStatsUpdate += dt;
		while(this.elapsedSinceSpawn > 1.0/this.spawnRate) {
			this.elapsedSinceSpawn -= 1.0/this.spawnRate;
			this.registerUser(this.creator.spawnUserRandomly(this.elapsedTime, this.floors.length, this.floorHeight, this.floors));
		}

		// Use regular for loops for performance and memory friendlyness
		for(let e of this.elevators) {
			e.update(dt);
			e.updateElevatorMovement(dt);
		}
		for(let u of this.users) {
			u.update(dt);
			this.maxWaitTime = Math.max(this.maxWaitTime, this.elapsedTime - u.spawnTimestamp);
		}
		this.users = this.users.filter(u => !u.removeMe);
		
		this.recalculateStats();
	}

	updateDisplayPositions() {
		for(let elevator of this.elevators) {
			elevator.updateDisplayPosition();
		}
		for(let user of this.users) {
			user.updateDisplayPosition();
		}
	}

	unWind() {
		console.log("Unwinding", this);
		
		// Note: need to be used when ElevatorInterface gets filled in?
		type AllOfThem = Elevator | ElevatorInterface | User | Floor | World;
		[
			this.elevators,
			this.elevatorInterfaces,
			this.users,
			this.floors,
			[ this ]
		].flat().forEach(obj => obj.off('*'));
		
		this.challengeEnded = true;
		this.elevators = this.elevatorInterfaces = this.users = this.floors = [];
	}

	init() {
		// Checking the floor queue of the elevators triggers the idle event here
		for(let elevInter of this.elevatorInterfaces) {
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
	timeScale: number;
	isPaused: boolean;
	dtMax: number;
	
	constructor(dtMax: number) {
		super();
		this.dtMax = dtMax;

		this.timeScale = 1.0;
		this.isPaused = true;
	}
	
	start(world: World, codeObj: UserCodeObject, animationFrameRequester: (cb: (t: number) => void) => void, autoStart?: boolean) {
		this.isPaused = true;
		let lastT: null | number = null;
		let firstUpdate = true;
		world.on("usercode_error", this.handleUserCodeError);
		let updater = (t: number) => {
			if(!this.isPaused && !world.challengeEnded && lastT !== null) {
				if(firstUpdate) {
					firstUpdate = false;
					// This logic prevents infite loops in usercode from breaking the page permanently - don't evaluate user code until game is unpaused.
					try {
						codeObj.init(world.elevatorInterfaces, world.floors);
						world.init();
					} catch(e) { this.handleUserCodeError(e); }
				}

				var dt = (t - lastT);
				var scaledDt = dt * 0.001 * this.timeScale;
				scaledDt = Math.min(scaledDt, this.dtMax * 3 * this.timeScale); // Limit to prevent unhealthy substepping
				try {
					if(codeObj.update) // .update is optional
						codeObj.update(scaledDt, world.elevatorInterfaces, world.floors);
				} catch(e) { this.handleUserCodeError(e); }

				while(scaledDt > 0.0 && !world.challengeEnded) {
					var thisDt = Math.min(this.dtMax, scaledDt);
					world.update(thisDt);
					scaledDt -= this.dtMax;
				}
				world.updateDisplayPositions();
				world.trigger("stats_display_changed"); // TODO: Trigger less often for performance reasons etc
			}
			lastT = t;
			if(!world.challengeEnded) {
				animationFrameRequester(updater);
			}
		};
		if(autoStart) {
			this.setPaused(false);
		}
		animationFrameRequester(updater);
	}

	handleUserCodeError = (e) => {
		this.setPaused(true);
		console.log("Usercode error on update", e);
		this.trigger("usercode_error", e);
	}

	setPaused(paused: boolean) {
		this.isPaused = paused;
		this.trigger("timescale_changed");
	}
	setTimeScale(timeScale) {
		this.timeScale = timeScale;
		this.trigger("timescale_changed");
	}
}
