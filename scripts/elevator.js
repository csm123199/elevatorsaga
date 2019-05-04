import { newGuard, limitNumber, distanceNeededToAchieveSpeed, accelerationNeededToAchieveChangeDistance, deprecationWarning, epsilonEquals } from './base.js';
import { Movable } from './movable.js';
function newElevStateHandler(elevator) {
    elevator.handleNewState();
}
export class Elevator extends Movable {
    constructor(speedFloorsPerSec, floorCount, floorHeight, maxUsers) {
        super();
        newGuard(this, Elevator);
        //Movable.call(this);
        //var elevator = this;
        this.ACCELERATION = floorHeight * 2.1;
        this.DECELERATION = floorHeight * 2.6;
        this.MAXSPEED = floorHeight * speedFloorsPerSec;
        this.floorCount = floorCount;
        this.floorHeight = floorHeight;
        this.maxUsers = maxUsers || 4;
        this.destinationY = 0.0;
        this.velocityY = 0.0;
        // isMoving flag is needed when going to same floor again - need to re-raise events
        this.isMoving = false;
        this.goingDownIndicator = true;
        this.goingUpIndicator = true;
        this.currentFloor = 0;
        this.previousTruncFutureFloorIfStopped = 0;
        this.buttonStates = new Array(floorCount).fill(false);
        this.moveCount = 0;
        this.removed = false;
        this.userSlots = new Array(this.maxUsers).fill(undefined).map((user, i) => {
            return { pos: [2 + (i * 10), 30], user: null };
        });
        this.width = this.maxUsers * 10;
        this.destinationY = this.getYPosOfFloor(this.currentFloor);
        this.on("new_state", newElevStateHandler);
        this.on("change:goingUpIndicator", (value) => {
            this.trigger("indicatorstate_change", { up: this.goingUpIndicator, down: this.goingDownIndicator });
        });
        this.on("change:goingDownIndicator", (value) => {
            this.trigger("indicatorstate_change", { up: this.goingUpIndicator, down: this.goingDownIndicator });
        });
    }
    trigger(event, ...args) {
        super.trigger(event, ...args);
        return this;
    }
    setFloorPosition(floor) {
        let destination = this.getYPosOfFloor(floor);
        this.currentFloor = floor;
        this.previousTruncFutureFloorIfStopped = floor;
        this.moveTo(null, destination);
    }
    ;
    /**
     * Return user's x,y position if space in elevator, otherwise, return false if full.
     * @param user A User object
     */
    userEntering(user) {
        let randomOffset = Math.floor(Math.random() * (this.userSlots.length));
        for (var i = 0; i < this.userSlots.length; i++) {
            var slot = this.userSlots[(i + randomOffset) % this.userSlots.length];
            if (slot.user === null) {
                slot.user = user;
                return slot.pos;
            }
        }
        return false;
    }
    ;
    pressFloorButton(floorNumber) {
        var prev;
        floorNumber = limitNumber(floorNumber, 0, this.floorCount - 1);
        prev = this.buttonStates[floorNumber];
        this.buttonStates[floorNumber] = true;
        if (!prev) {
            this.trigger("floor_button_pressed", floorNumber);
            this.trigger("floor_buttons_changed", this.buttonStates, floorNumber);
        }
    }
    ;
    // TODO: Get proper user type
    userExiting(user) {
        for (var i = 0; i < this.userSlots.length; i++) {
            var slot = this.userSlots[i];
            if (slot.user === user) {
                slot.user = null;
            }
        }
    }
    ;
    updateElevatorMovement(deltaTime) {
        if (this.isBusy()) {
            // TODO: Consider if having a nonzero velocity here should throw error..
            return;
        }
        // Make sure we're not speeding
        this.velocityY = limitNumber(this.velocityY, -this.MAXSPEED, this.MAXSPEED);
        // Move elevator
        this.moveTo(null, this.y + this.velocityY * deltaTime);
        var destinationDiff = this.destinationY - this.y;
        var directionSign = Math.sign(destinationDiff);
        var velocitySign = Math.sign(this.velocityY);
        var acceleration = 0.0;
        if (destinationDiff !== 0.0) {
            if (directionSign === velocitySign) {
                // Moving in correct direction
                var distanceNeededToStop = distanceNeededToAchieveSpeed(this.velocityY, 0.0, this.DECELERATION);
                if (distanceNeededToStop * 1.05 < -Math.abs(destinationDiff)) {
                    // Slow down
                    // Allow a certain factor of extra breaking, to enable a smooth breaking movement after detecting overshoot
                    var requiredDeceleration = accelerationNeededToAchieveChangeDistance(this.velocityY, 0.0, destinationDiff);
                    var deceleration = Math.min(this.DECELERATION * 1.1, Math.abs(requiredDeceleration));
                    this.velocityY -= directionSign * deceleration * deltaTime;
                }
                else {
                    // Speed up (or keep max speed...)
                    acceleration = Math.min(Math.abs(destinationDiff * 5), this.ACCELERATION);
                    this.velocityY += directionSign * acceleration * deltaTime;
                }
            }
            else if (velocitySign === 0) {
                // Standing still - should accelerate
                acceleration = Math.min(Math.abs(destinationDiff * 5), this.ACCELERATION);
                this.velocityY += directionSign * acceleration * deltaTime;
            }
            else {
                // Moving in wrong direction - decelerate as much as possible
                this.velocityY -= velocitySign * this.DECELERATION * deltaTime;
                // Make sure we don't change direction within this time step - let standstill logic handle it
                if (Math.sign(this.velocityY) !== velocitySign) {
                    this.velocityY = 0.0;
                }
            }
        }
        if (this.isMoving && Math.abs(destinationDiff) < 0.5 && Math.abs(this.velocityY) < 3) {
            // Snap to destination and stop
            this.moveTo(null, this.destinationY);
            this.velocityY = 0.0;
            this.isMoving = false;
            this.handleDestinationArrival();
        }
    }
    ;
    handleDestinationArrival() {
        this.trigger("stopped", this.getExactCurrentFloor());
        if (this.isOnAFloor()) {
            this.buttonStates[this.currentFloor] = false;
            this.trigger("floor_buttons_changed", this.buttonStates, this.currentFloor);
            this.trigger("stopped_at_floor", this.currentFloor);
            // Need to allow users to get off first, so that new ones
            // can enter on the same floor
            this.trigger("exit_available", this.currentFloor, this);
            this.trigger("entrance_available", this);
        }
    }
    ;
    goToFloor(floor) {
        this.makeSureNotBusy();
        this.isMoving = true;
        this.destinationY = this.getYPosOfFloor(floor);
    }
    ;
    getFirstPressedFloor() {
        deprecationWarning("getFirstPressedFloor");
        for (var i = 0; i < this.buttonStates.length; i++) {
            if (this.buttonStates[i]) {
                return i;
            }
        }
        return 0;
    }
    ;
    getPressedFloors() {
        let arr = [];
        for (let i = 0; i < this.buttonStates.length; i++) {
            if (this.buttonStates[i]) {
                arr.push(i);
            }
        }
        return arr;
    }
    ;
    isSuitableForTravelBetween(fromFloorNum, toFloorNum) {
        if (fromFloorNum > toFloorNum) {
            return this.goingDownIndicator;
        }
        if (fromFloorNum < toFloorNum) {
            return this.goingUpIndicator;
        }
        return true;
    }
    ;
    getYPosOfFloor(floorNum) {
        return (this.floorCount - 1) * this.floorHeight - floorNum * this.floorHeight;
    }
    ;
    getExactFloorOfYPos(y) {
        return ((this.floorCount - 1) * this.floorHeight - y) / this.floorHeight;
    }
    ;
    getExactCurrentFloor() {
        return this.getExactFloorOfYPos(this.y);
    }
    ;
    getDestinationFloor() {
        return this.getExactFloorOfYPos(this.destinationY);
    }
    ;
    getRoundedCurrentFloor() {
        return Math.round(this.getExactCurrentFloor());
    }
    ;
    getExactFutureFloorIfStopped() {
        var distanceNeededToStop = distanceNeededToAchieveSpeed(this.velocityY, 0.0, this.DECELERATION);
        return this.getExactFloorOfYPos(this.y - Math.sign(this.velocityY) * distanceNeededToStop);
    }
    ;
    isApproachingFloor(floorNum) {
        var floorYPos = this.getYPosOfFloor(floorNum);
        var elevToFloor = floorYPos - this.y;
        return this.velocityY !== 0.0 && (Math.sign(this.velocityY) === Math.sign(elevToFloor));
    }
    ;
    isOnAFloor() {
        return epsilonEquals(this.getExactCurrentFloor(), this.getRoundedCurrentFloor());
    }
    ;
    getLoadFactor() {
        let load = 0;
        for (let slot of this.userSlots) {
            if (slot.user !== null) {
                load += slot.user.weight;
            }
        }
        return load / (this.maxUsers * 100);
    }
    ;
    isFull() {
        for (let slot of this.userSlots) {
            if (slot.user === null)
                return false;
        }
        return true;
    }
    ;
    isEmpty() {
        for (let slot of this.userSlots) {
            if (slot.user !== null) {
                return false;
            }
        }
        return true;
    }
    ;
    handleNewState() {
        // Recalculate the floor number etc
        let currentFloor = this.getRoundedCurrentFloor();
        if (currentFloor !== this.currentFloor) {
            this.moveCount++;
            this.currentFloor = currentFloor;
            this.trigger("new_current_floor", this.currentFloor);
        }
        // Check if we are about to pass a floor
        let futureTruncFloorIfStopped = Math.trunc(this.getExactFutureFloorIfStopped());
        if (futureTruncFloorIfStopped !== this.previousTruncFutureFloorIfStopped) {
            // The following is somewhat ugly.
            // A formally correct solution should iterate and generate events for all passed floors,
            // because the elevator could theoretically have such a velocity that it would
            // pass more than one floor over the course of one state change (update).
            // But I can't currently be arsed to implement it because it's overkill.
            let floorBeingPassed = Math.round(this.getExactFutureFloorIfStopped());
            // Never emit passing_floor event for the destination floor
            // Because if it's the destination we're not going to pass it, at least not intentionally
            if (this.getDestinationFloor() !== floorBeingPassed && this.isApproachingFloor(floorBeingPassed)) {
                let direction = this.velocityY > 0.0 ? "down" : "up";
                this.trigger("passing_floor", floorBeingPassed, direction);
            }
        }
        this.previousTruncFutureFloorIfStopped = futureTruncFloorIfStopped;
    }
    ;
}
//# sourceMappingURL=elevator.js.map