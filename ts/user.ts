
import { Movable, linearInterpolate } from './movable.js'
import { Elevator } from './elevator.js'

// TODO: impl floor in TS
type Floor = any;
export type UserDisplayType = "child" | "female" | "male";

export interface User {
	trigger(event: "removed"): this;
	trigger(event: "entered_elevator", elevator: Elevator): this;
	trigger(event: "exited_elevator", elevator: Elevator): this;

	// extends Movable
	trigger(event: "new_state", self: this): this; // Movable
	trigger(event: "new_display_state", self: this): this; // Movable
}
export class User extends Movable {
	readonly weight: number;
	readonly displayType: UserDisplayType;
	readonly spawnTimestamp: number;
	currentFloor: number = 0;
	destinationFloor: number = 0;
	done: boolean = false;
	removeMe: boolean = false;

	constructor(weight: number, displayType: UserDisplayType, spawnTimestamp: number) {
		super();
		this.weight = weight;
		this.displayType = displayType;
		this.spawnTimestamp = spawnTimestamp;
	}

	// TODO: floor definition
	appearOnFloor(floor: Floor, destinationFloorNum: number) {
		const floorPosY = floor.getSpawnPosY();
		this.currentFloor = floor.level;
		this.destinationFloor = destinationFloorNum;
		this.moveTo(null, floorPosY);
		this.pressFloorButton(floor);
	};

	pressFloorButton(floor: Floor) {
		if(this.destinationFloor < this.currentFloor) {
			floor.pressDownButton();
		} else {
			floor.pressUpButton();
		}
	};

	handleExit(floorNum: number, elevator: Elevator) {
		if(elevator.currentFloor === this.destinationFloor) {
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
			}
			this.moveToOverTime(destination, null, 1 + Math.random()*0.5, linearInterpolate, lastMove);

			elevator.off("exit_available", this.exitAvailableHandler);
		}
	};

	elevatorAvailable(elevator: Elevator, floor: Floor) {
		if(this.done || this.parent !== null || this.isBusy()) {
			return;
		}

		if(!elevator.isSuitableForTravelBetween(this.currentFloor, this.destinationFloor)) {
			// Not suitable for travel - don't use this elevator
			return;
		}

		var pos = elevator.userEntering(this); // if there's space in the elevator...
		if(pos) {
			// Success
			this.setParent(elevator);
			this.trigger("entered_elevator", elevator);
			this.moveToOverTime(pos[0], pos[1], 1, undefined, () => {
				elevator.pressFloorButton(this.destinationFloor);
			});
			elevator.on("exit_available", this.exitAvailableHandler);
		} else {
			this.pressFloorButton(floor);
		}
	}
	protected exitAvailableHandler = (floorNum: number, elevator: Elevator) => {
		this.handleExit(elevator.currentFloor, elevator);
	}
}
