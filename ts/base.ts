
import { Floor } from './floor.js'
import { ElevatorInterface } from './interfaces.js'

export const USERCODE_MODULE_NAME = 'UserCode';

export interface FrameRequest {
	/** The time, based on triggered timeSteps */
	currentT: number;
	/** cb can be null - change if so */
	register: (cb: (t: number) => void) => void;
	/** Calls the registered function */
	trigger: () => void;
}
export interface UserCodeObject {
	init: (elevatorInterfaces: ElevatorInterface[], floors: Floor[]) => void;
	update?: (scaledDt: number, elevatorInterfaces: ElevatorInterface[], floors: Floor[]) => void;
}

export function random(max: number, inclusive: boolean = true): number {
	return Math.floor(Math.random()*(max + (inclusive ? 1 : 0)));
}
export function randomRange(min: number, max: number, inclusive: boolean = true): number {
	return min + Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0)));
}

export function limitNumber(num: number, min: number, max: number) {
	return Math.min(max, Math.max(num, min));
};

export function epsilonEquals(a: number, b: number) {
	return Math.abs(a-b) < 0.00000001;
};

export function deprecationWarning(name: string): void;
export function deprecationWarning(name: any): void {
	console.warn("You are using a deprecated feature scheduled for removal: " + name);
};

export function objectFactory<T>(names: (keyof T)[], transform: (key: keyof T) => T[keyof T]) {
	return names.reduce<Partial<T>>((obj, key: keyof T) => {
		obj[key] = transform(key);
		return obj;
	}, {} as Partial<T>) as T;
}

export interface BoolGetterSetter<T> {
	(val: boolean): T;
	(): boolean;
	(val?: boolean): T | boolean;
};

// Make object with each key having its name as its type
type FilterByType__<T, TT> = {
	[P in keyof T]: T[P] extends TT ? P : never;
};
type AllowedKeys<T, TT> = FilterByType__<T, TT>[keyof T];
type TypedSubset<T, TT> = Pick<T, AllowedKeys<T, TT>>;

// Returns function to set/get bool `obj[objPropertyName]` and (if setting) return `owner` otherwise return `obj[objPropertyName]
export function createBoolPassthroughFunction<T, Y, K extends AllowedKeys<Y, boolean>>(host: T, owner: Y, prop: K): BoolGetterSetter<T> {
	function getter_setter(val: boolean): T;
	function getter_setter(): boolean;
	function getter_setter(val?: boolean): T | boolean {
		if(val === undefined) { // Getter
			// Can't figure out the proper typing so just suppressing the type check, since the signature is valid anyway
			//@ts-ignore
			return owner[prop];
		} else { // Setter
			//@ts-ignore
			owner[prop] = val;
			return host;
		}
	}
	return getter_setter;
}

export function distanceNeededToAchieveSpeed(currentSpeed: number, targetSpeed: number, acceleration: number) {
	// v² = u² + 2a * d
	let requiredDistance = (Math.pow(targetSpeed, 2) - Math.pow(currentSpeed, 2)) / (2 * acceleration);
	return requiredDistance;
};
export function accelerationNeededToAchieveChangeDistance(currentSpeed: number, targetSpeed: number, distance: number) {
	// v² = u² + 2a * d
	let requiredAcceleration = 0.5 * ((Math.pow(targetSpeed, 2) - Math.pow(currentSpeed, 2)) / distance);
	return requiredAcceleration;
};

// Fake frame requester helper used for testing and fitness simulations
export function createFrameRequester(timeStep: number): FrameRequest {
	let currentCb: null | ((t: number) => void) = null;
	let requester: FrameRequest = {
		currentT: 0.0,
		register: function(cb) {
			currentCb = cb;
		},
		trigger: function() {
			requester.currentT += timeStep;
			if(currentCb !== null) {
				currentCb(requester.currentT);
			}
		}
	};
	return requester;
};

function asDataURI(c: string): string {
	// note: *not* unicode safe
	return 'data:text/javascript;base64,' + btoa(c);
}

export async function getCodeObjFromCode(code: string): Promise<UserCodeObject> {
	// Change the 'name' of the file so it doesn't appear as a giant base64 str in the stacktrace
	code += `\n\n//# sourceURL=${USERCODE_MODULE_NAME}.js`
	
	let dataURI = asDataURI(code);
	let userModule: UserCodeObject = await import(dataURI);
	if(typeof userModule.init !== "function") {
		throw new TypeError("exported `init` is not a function! (has it been exported?)");
	}
	if(typeof userModule.update !== "function" && typeof userModule.update !== "undefined") {
		throw new TypeError("exported `update` is not a function!");
	}
	return userModule;
}

