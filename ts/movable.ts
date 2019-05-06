

declare const riot: typeof import('./riot_types');
import { Observable, ObservableCallback } from './riot_types'

import { newGuard } from './base.js'

type WithReturnType<T extends (...args: any) => any, RT> = T extends (...args: infer P) => RT ? (...args: P) => RT : never;

const EPSILON = 0.00001;

type Interpolator = (value0: number, value1: number, x: number) => number;
export function linearInterpolate(value0: number, value1: number, x: number): number {
	return value0 + (value1 - value0) * x;
}
export function powInterpolate(value0: number, value1: number, x: number, a: number): number {
	return value0 + (value1 - value0) * Math.pow(x, a) / (Math.pow(x, a) + Math.pow(1-x, a));
}
export function coolInterpolate(value0: number, value1: number, x: number): number {
	return powInterpolate(value0, value1, x, 1.3);
}
export let DEFAULT_INTERPOLATOR: Interpolator = coolInterpolate;

const _tmpPosStorage: [number, number] = [0,0];

const DEBUG_FILTER_BLACKLIST = ['stats_changed', 'stats_display_changed']

export class ObservableClass implements Observable {
	private readonly asObservable;
	private readonly asOriginal;
	constructor() {
		// Backup own functions (these will get overwritten by riot.observable(this)
		this.asOriginal = {
			on: this.on,
			one: this.one,
			off: this.off,
			trigger: this.trigger
		};

		//this.internalObservable = riot.observable(this);
		riot.observable(this);
		this.asObservable = {
			on: this.on,
			one: this.one,
			off: this.off,
			trigger: this.trigger
		}

		// re-install own observable wrappers
		// old ones have been overwritten by riot.observable(this)
		
		this.on = this.asOriginal.on;
		this.one = this.asOriginal.one;
		this.off = this.asOriginal.off;
		this.trigger = this.asOriginal.trigger;
	}

	// There is no inheritable version of `observable()`.
	on(event: string, callback: ObservableCallback): this { // look into super.on(...)
		if(!DEBUG_FILTER_BLACKLIST.some(v => event == v))
			console.log(`[DEBUG] registering event handler on ${this.constructor.name}: ${event}`);
		return this.asObservable.on(event, callback);
	}
	one(event: string, callback: ObservableCallback): this {
		return this.asObservable.one(event, callback);
	}
	/** Deregister all event handlers */
	off(event: "*"): this;
	/** Register an event handler for `event` */
	off(event: string, callback: ObservableCallback): this;
	off(event: string, callback?: ObservableCallback): this {
		return this.asObservable.off(event, callback);
	}
	trigger(event: string, ...args: any[]): this {
		if(!DEBUG_FILTER_BLACKLIST.some(v => event == v))
			console.log(`[DEBUG] event triggered ${this.constructor.name}: ${event}(${args.map(v => v.toString()).join()})`);
		return this.asObservable.trigger(event, ...args);
	}


}

export class Movable extends ObservableClass {
	movable: Movable;
	x: number;
	y: number;
	parent: null | Movable;
	worldX: number;
	worldY: number;
	currentTask: null | ((deltaTime: number) => void);

	constructor() {
		super();
		newGuard(this, Movable); // assert this is a Movable object

		this.movable = this;
		this.x = 0.0;
		this.y = 0.0;
		this.parent = null;
		this.worldX = 0.0;
		this.worldY = 0.0;
		this.currentTask = null;

		this.trigger('new_state', this);
	}

	updateDisplayPosition(forceTrigger?: boolean) {
		this.getWorldPosition(_tmpPosStorage);
		var oldX = this.worldX;
		var oldY = this.worldY;
		this.worldX = _tmpPosStorage[0];
		this.worldY = _tmpPosStorage[1];
		if(oldX !== this.worldX || oldY !== this.worldY || forceTrigger === true) {
			this.trigger('new_display_state', this);
		}
	}

	moveTo(newX: null | number, newY: null | number) {
		if(newX !== null) { this.x = newX; }
		if(newY !== null) { this.y = newY; }
		this.trigger("new_state", this);
	}

	moveToFast(newX: number, newY: number) {
		this.x = newX;
		this.y = newY;
		this.trigger("new_state", this);
	}
	
	isBusy(): boolean {
		return this.currentTask !== null;
	}
	
	makeSureNotBusy() {
		if(this.isBusy()) {
			console.error("Attempt to use movable while it was busy", this);
			throw({message: "Object is busy - you should use callback", obj: this});
		}
	}

	wait(millis: number, cb?: () => void) {
		this.makeSureNotBusy();
		let timeSpent = 0.0;
		const waitTask = (dt: number) => {
			timeSpent += dt;
			if(timeSpent > millis) {
				this.currentTask = null;
				if(cb) { cb(); }
			}
		};
		this.currentTask = waitTask;
	};
	
	moveToOverTime(newX: null | number, newY: null | number, timeToSpend: number, interpolator: undefined | Interpolator, cb: () => void) {
		this.makeSureNotBusy();

		const interpolatorfn = interpolator === undefined ? DEFAULT_INTERPOLATOR : interpolator;
		const nextX = newX !== null ? newX : this.x;
		const nextY = newY !== null ? newY : this.y;

		const origX = this.x;
		const origY = this.y;
		let timeSpent = 0.0;
		const moveToOverTimeTask = (dt: number) => {
			timeSpent = Math.min(timeToSpend, timeSpent + dt);
			if(timeSpent === timeToSpend) { // Epsilon issues possibly?
				this.moveToFast(nextX, nextY);
				this.currentTask = null;
				if(cb) { cb(); }
			} else {
				const factor = timeSpent / timeToSpend;
				this.moveToFast(interpolatorfn(origX, nextX, factor), interpolatorfn(origY, nextY, factor));
			}
		};
		this.currentTask = moveToOverTimeTask;
	};
	
	update(deltaTime: number) {
		if(this.currentTask !== null) {
			this.currentTask(deltaTime);
		}
	};
	
	getWorldPosition(storage: [number, number]) {
		let { x, y } = this;
		var currentParent = this.parent;
		while(currentParent !== null) {
			x += currentParent.x;
			y += currentParent.y;
			currentParent = currentParent.parent;
		}
		storage[0] = x;
		storage[1] = y;
	};
	
	setParent(movableParent: null | Movable) {
		let objWorld: [number, number] = [0,0];
		if(movableParent === null) {
			if(this.parent !== null) {
				this.getWorldPosition(objWorld);
				this.parent = null;
				this.moveToFast(objWorld[0], objWorld[1]);
			}
		} else {
			// Parent is being set a non-null movable
			this.getWorldPosition(objWorld);
			
			let parentWorld: [number, number] = [0,0];
			movableParent.getWorldPosition(parentWorld);
			this.parent = movableParent;

			this.moveToFast(objWorld[0] - parentWorld[0], objWorld[1] - parentWorld[1]);
		}
	}
}

