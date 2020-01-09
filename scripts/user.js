import { Movable, linearInterpolate } from './movable.js';
export class User extends Movable {
    constructor(weight, displayType, spawnTimestamp) {
        super();
        this.currentFloor = 0;
        this.destinationFloor = 0;
        this.done = false;
        this.removeMe = false;
        this.exitAvailableHandler = (floorNum, elevator) => {
            this.handleExit(elevator.currentFloor, elevator);
        };
        this.weight = weight;
        this.displayType = displayType;
        this.spawnTimestamp = spawnTimestamp;
    }
    // TODO: floor definition
    appearOnFloor(floor, destinationFloorNum) {
        const floorPosY = floor.getSpawnPosY();
        this.currentFloor = floor.level;
        this.destinationFloor = destinationFloorNum;
        this.moveTo(null, floorPosY);
        this.pressFloorButton(floor);
    }
    ;
    pressFloorButton(floor) {
        if (this.destinationFloor < this.currentFloor) {
            floor.pressDownButton();
        }
        else {
            floor.pressUpButton();
        }
    }
    ;
    handleExit(floorNum, elevator) {
        if (elevator.currentFloor === this.destinationFloor) {
            elevator.userExiting(this);
            this.currentFloor = elevator.currentFloor;
            this.setParent(null);
            var destination = this.x + 100;
            this.done = true;
            this.trigger("exited_elevator", elevator);
            this.trigger("new_state", this);
            this.trigger("new_display_state", this);
            var self = this;
            const lastMove = () => {
                this.removeMe = true;
                this.trigger("removed");
                this.off("*");
            };
            this.moveToOverTime(destination, null, 1 + Math.random() * 0.5, linearInterpolate, lastMove);
            elevator.off("exit_available", this.exitAvailableHandler);
        }
    }
    ;
    elevatorAvailable(elevator, floor) {
        if (this.done || this.parent !== null || this.isBusy()) {
            return;
        }
        if (!elevator.isSuitableForTravelBetween(this.currentFloor, this.destinationFloor)) {
            // Not suitable for travel - don't use this elevator
            return;
        }
        var pos = elevator.userEntering(this); // if there's space in the elevator...
        if (pos) {
            // Success
            this.setParent(elevator);
            this.trigger("entered_elevator", elevator);
            this.moveToOverTime(pos[0], pos[1], 1, undefined, () => {
                elevator.pressFloorButton(this.destinationFloor);
            });
            elevator.on("exit_available", this.exitAvailableHandler);
        }
        else {
            this.pressFloorButton(floor);
        }
    }
}
//# sourceMappingURL=user.js.map