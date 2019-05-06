
import { Observable } from './observable.js'
import { Elevator } from './elevator.js';

type ButtonState = "" | "activated";
interface ButtonStates {
	up: ButtonState;
	down: ButtonState;
}

export class Floor extends Observable {
	readonly level: number;
	readonly yPosition: number;
	buttonStates_: ButtonStates;
	//buttonStates: ButtonStates;
	errorHandler: (e: any) => void;

	constructor(floorLevel: number, yPosition: number, errorHandler: Floor['errorHandler']) {
		super();
		this.level = floorLevel;
		this.yPosition = yPosition;
		this.buttonStates_ = {up: "", down: ""};
		
		this.errorHandler = errorHandler;
	}
	get buttonStates() {
		//debugger;
		return this.buttonStates_;
	}
	set buttonStates(newstate: ButtonStates) {
		//debugger;
		this.buttonStates_ = newstate;
	}

	// poision overload for tryTrigger to override (other users shouldn't use trigger directly here)
	trigger(event: never): this;
	trigger(event: string, ...args: any[]): this {
		return super.trigger(event, ...args);
	}
	tryTrigger(event: "up_button_pressed", self: this): this;
	tryTrigger(event: "down_button_pressed", self: this): this;
	tryTrigger(event: "buttonstate_change", buttonStates: ButtonStates): this;
	tryTrigger(event: "new_current_floor", currentFloor: number): this;
	// Note: TODO from original repo
	// TODO: Ideally the floor should have a facade where tryTrigger is done
	tryTrigger(event: string, ...args: any[]): this {
		try {
			// eliminate poison overload
			(this.trigger as (e: string, ...args) => this)(event, ...args);
		} catch(e) {
			this.errorHandler(e);
		}
		return this;
	}
	pressUpButton() {
		var prev = this.buttonStates.up;
		this.buttonStates.up = "activated";
		if(prev !== this.buttonStates.up) {
			this.tryTrigger("buttonstate_change", this.buttonStates);
			this.tryTrigger("up_button_pressed", this);
		}
	};

	pressDownButton() {
		var prev = this.buttonStates.down;
		this.buttonStates.down = "activated";
		if(prev !== this.buttonStates.down) {
			this.tryTrigger("buttonstate_change", this.buttonStates);
			this.tryTrigger("down_button_pressed", this);
		}
	};

	elevatorAvailable(elevator: Elevator) {
		if(elevator.goingUpIndicator && this.buttonStates_.up !== "") {
			this.buttonStates.up = "";
			this.tryTrigger("buttonstate_change", this.buttonStates);
		}
		if(elevator.goingDownIndicator && this.buttonStates_.down !== "") {
			this.buttonStates.down = "";
			this.tryTrigger("buttonstate_change", this.buttonStates);
		}
	};

	getSpawnPosY() {
		return this.yPosition + 30;
	};

	floorNum() {
		return this.level;
	};
}
