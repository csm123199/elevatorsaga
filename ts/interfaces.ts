import { Observable } from "./observable.js";
import { Elevator } from "./elevator.js";
import { epsilonEquals, limitNumber, createBoolPassthroughFunction } from "./base.js";

export interface ElevatorInterface {
	// Poison .trigger so the user won't use this
	trigger(event: never): this;
	
	on(event: "idle"): this;
	on(event: "passing_floor", cb: (floorNum: number, direction: "up" | "down") => void): this;
	on(event: "stopped_at_floor", cb: (floorNum: number) => void): this;
	on(event: "floor_button_pressed", cb: (floorNum: number) => void): this;

	one(event: "idle"): this;
	one(event: "passing_floor", cb: (floorNum: number, direction: "up" | "down") => void): this;
	one(event: "stopped_at_floor", cb: (floorNum: number) => void): this;
	one(event: "floor_button_pressed", cb: (floorNum: number) => void): this;

	off(event: "*"): this;
	off(event: "idle"): this;
	off(event: "passing_floor", cb: (floorNum: number, direction: "up" | "down") => void): this;
	off(event: "stopped_at_floor", cb: (floorNum: number) => void): this;
	off(event: "floor_button_pressed", cb: (floorNum: number) => void): this;
	off(event: string, cb?: (...args: any[]) => void): this;
}

// Interface that hides actual elevator object behind a more robust facade,
// while also exposing relevant events, and providing some helper queue
// functions that allow programming without async logic.
export class ElevatorInterface extends Observable {
	readonly elevator: Elevator;
	readonly floorCount: number;
	readonly errorHandler: (e: any) => void;
	destinationQueue: number[] = [];
	
	constructor(elevator: Elevator, floorCount: number, errorHandler: (e: any) => void) {
		super();
		this.elevator = elevator;
		this.floorCount = floorCount;
		this.errorHandler = errorHandler;

		elevator.on("stopped", (position) => {
			if(this.destinationQueue.length && epsilonEquals(this.destinationQueue[0], position)) {
				// Reached the destination, so remove element at front of queue
				this.destinationQueue.shift();
				if(elevator.isOnAFloor()) {
					elevator.wait(1, () => {
						this.checkDestinationQueue();
					});
				} else {
					this.checkDestinationQueue();
				}
			}
		});
	
		elevator.on("passing_floor", (floorNum, direction) => {
			this.tryTrigger("passing_floor", floorNum, direction);
		});
	
		elevator.on("stopped_at_floor", (floorNum) => {
			this.tryTrigger("stopped_at_floor", floorNum);
		});
		elevator.on("floor_button_pressed", (floorNum) => {
			this.tryTrigger("floor_button_pressed", floorNum);
		});
	}

	tryTrigger(event: "idle"): this;
	tryTrigger(event: "passing_floor", floorNum: number, direction: "up" | "down"): this;
	tryTrigger(event: "stopped_at_floor", floorNum: number): this;
	tryTrigger(event: "floor_button_pressed", floorNum: number): this;
	tryTrigger(event: string, ...args: any[]): this {
		try {
			// Try/catch since user code could attach handlers to this class
			super.trigger(event, ...args);
		} catch(e) {
			this.errorHandler(e);
		}
		return this;
	}

	/**
	 * If the elevator is not busy, go to the first floor in the queue.
	 */
	checkDestinationQueue(): void {
		if(!this.elevator.isBusy()) {
			if(this.destinationQueue.length > 0) {
				this.elevator.goToFloor(this.destinationQueue[0]);
			} else {
				this.tryTrigger("idle");
			}
		}
	}

	// TODO: Write tests for this queueing logic
	/**
	 * Queue the elevator to go to a certain floor.  
	 * If `forceNow` is truthy, then add the floor to the beginning of the queue.
	 */
	goToFloor(floorNum: number, forceNow?: boolean): void {
		floorNum = limitNumber(Number(floorNum), 0, this.floorCount - 1);
		// Auto-prevent immediately duplicate destinations
		if(this.destinationQueue.length > 0) {
			let adjacentElement = forceNow ? this.destinationQueue[0] : this.destinationDirection[this.destinationQueue.length-1]
			if(epsilonEquals(floorNum, adjacentElement)) {
				return;
			}
		}

		// Go to beginning of queue if forcing else end
		this.destinationQueue[forceNow ? "unshift" : "push"](floorNum);
		this.checkDestinationQueue();
	};

	/**
	 * Clear the destination queue, and stop moving the elevator.
	 */
	stop(): void {
		this.destinationQueue = [];
		if(!this.elevator.isBusy()) {
			this.elevator.goToFloor(this.elevator.getExactFutureFloorIfStopped());
		}
	};

	// Undocumented and deprecated, will be removed
	getFirstPressedFloor() { return this.elevator.getFirstPressedFloor() }

	getPressedFloors() { return this.elevator.getPressedFloors() }
	currentFloor() { return this.elevator.currentFloor }
	maxPassengerCount() { return this.elevator.maxUsers }
	loadFactor() { return this.elevator.getLoadFactor() }
	destinationDirection(): "stopped"|"down"|"up" {
		const { destinationY, y } = this.elevator;
		if(destinationY === y) {
			return "stopped";
		}
		return destinationY > y ? "down" : "up";
	}
	
	goingUpIndicator = (v?: boolean): this | boolean => createBoolPassthroughFunction(this, this.elevator, "goingUpIndicator")(v);
	goingDownIndicator = (v?: boolean): this | boolean => createBoolPassthroughFunction(this, this.elevator, "goingDownIndicator")(v);
}


