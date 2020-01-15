
//declare const riot: typeof import('./riot_types');
//@ts-ignore
import { observable } from './libs/riot.es6.js'
//import observable from '@riotjs/observable'
//import observable from '../node_modules/@riotjs/observable/dist/es6.observable.js'
import { Observable as RiotObservable, ObservableCallback } from './riot_types'

const LOG_EVENTS = false;
const DEBUG_FILTER_BLACKLIST = ['stats_changed', 'stats_display_changed'];

export class Observable implements RiotObservable {
	private readonly asObservable: RiotObservable;
	constructor() {
		// Assign observable functions to ourselves
		observable(this);
		// backup observable functions to seperate method
		this.asObservable = {
			on: this.on,
			one: this.one,
			off: this.off,
			trigger: this.trigger,
		};
		// own function's are gonna be installed after the constructor
	}

	// There is no inheritable version of `observable()`.
	on(event: string, callback: ObservableCallback): this { // look into super.on(...)
		if(LOG_EVENTS && !DEBUG_FILTER_BLACKLIST.some(v => event == v))
			console.log(`[DEBUG] registering event handler on ${this.constructor.name}: ${event}`);
		return this.asObservable.on(event, callback) as this;
	}
	// Poison event handler since nothing uses it
	one(event: never, callback: never): this;
	one(event: string, callback: ObservableCallback): this {
		return this.asObservable.one(event, callback) as this;
	}
	/** Deregister all event handlers */
	off(event: "*"): this;
	/** Register an event handler for `event` */
	off(event: string, callback: ObservableCallback): this;
	off(event: string, callback?: ObservableCallback): this {
		return this.asObservable.off(event, callback) as this;
	}
	trigger(event: string, ...args: any[]): this {
		if(LOG_EVENTS && !DEBUG_FILTER_BLACKLIST.some(v => event == v))
			console.log(`[DEBUG] event triggered ${this.constructor.name}: ${event}(${args.map(v => v.toString()).join()})`);
		return this.asObservable.trigger(event, ...args) as this;
	}
}
