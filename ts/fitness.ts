
//declare const _: typeof import('lodash')
import * as _ from 'lodash';
import { getCodeObjFromCode, UserCodeObject, createFrameRequester, objectFactory } from './base'
import { WorldController, WorldCreator } from './world'
import { Challenge, WinCondition, ChallengeOptions } from './challenges'

function requireNothing(): WinCondition {
	return {
		description: "No requirement",
		evaluate: function() { return null; }
	};
};

const fitnessChallenges: Challenge[] = [
	 {options: {description: "Small scenario", floorCount: 4, elevatorCount: 2, spawnRate: 0.6}, condition: requireNothing()}
	,{options: {description: "Medium scenario", floorCount: 6, elevatorCount: 3, spawnRate: 1.5, elevatorCapacities: [5]}, condition: requireNothing()}
	,{options: {description: "Large scenario", floorCount: 18, elevatorCount: 6, spawnRate: 1.9, elevatorCapacities: [8]}, condition: requireNothing()}
]



// Simulation without visualisation
function calculateFitness(challenge: Challenge, codeObj: UserCodeObject, stepSize: number, stepsToSimulate: number): FitnessResult {
	const controller = new WorldController(stepSize);
	let result: FitnessResult | Error | null = null!;
	
	const worldCreator = new WorldCreator();
	const world = worldCreator.createWorld(challenge.options);
	const frameRequester = createFrameRequester(stepSize);

	controller.on("usercode_error", (e: Error) => {
		result = e;
	});
	world.on("stats_changed", () => {
		result = {
			transportedPerSec: world.transportedPerSec,
			avgWaitTime: world.avgWaitTime,
			transportedCount: world.transportedCounter,
		}
	});

	controller.start(world, codeObj, frameRequester.register, true);

	for(let stepCount=0; stepCount < stepsToSimulate && !controller.isPaused; stepCount++) {
		frameRequester.trigger();
	}

	// Ignore type checkers insistance that the two callbacks aren't called during the execution flow
	result = result!;

	if(result === null) {
		throw new Error('Recieved null result from fitness test...');
	} else if(result instanceof Error) {
		throw result;
	} else {
		return result;
	}
};

const pluck = <C extends T[], T>(obj: C, key: keyof T): T[typeof key][] => obj.map<T[typeof key]>(v => v[key]);

// If editing, remember to edit makeAverageResult.fitnessKeys
interface FitnessResult {
	transportedPerSec: number;
	avgWaitTime: number;
	transportedCount: number;
}

function makeAverageResult(results: TestRun[]): TestRun {
	let fitnessKeys: (keyof FitnessResult)[] = ["transportedPerSec", "avgWaitTime", "transportedCount"];

	let averagedResult: FitnessResult = objectFactory(fitnessKeys, (k: keyof FitnessResult) => {
		var sum = results
			.map(v => v.result[k])
			.reduce((acc, v) => acc + v);
		return sum / results.length;
	})

	return {
		options: results[0].options, // TODO: Assert all the same (pass it as `options` param instead of bundling it w/ seperate TestRun interface? )
		result: averagedResult,
	};
};

export interface TestRun {
	options: ChallengeOptions;
	result: FitnessResult;
}

function times<T>(count: number, iteratee: (i: number) => T): T[] {
	const elements: T[] = [];
	for(let i = 0; i < count; i++) {
		elements.push(iteratee(i));
	}
	return elements;
}

export async function doFitnessSuite(codeStr: string, runCount: number): Promise<TestRun[]> {
	// Can throw, allow to bubble up
	let codeObj = await getCodeObjFromCode(codeStr);
	console.log("Fitness testing code", codeObj);

	// testruns[runCount][fitnessChallenges.length]

	// Can throw, allow to bubble up
	const testruns = times(runCount, () => // Run runCount times
		fitnessChallenges.map<TestRun>(challenge => ({ // Calculate fitness for each challenge
				options: challenge.options,
				result: calculateFitness(challenge, codeObj, 1000.0/60.0, 12000)
			})
		)
	)

	// Now do averaging over all properties for each challenge's test runs
	const averagedResults: TestRun[] = times(testruns[0].length, (n) => 
		makeAverageResult(testruns.map(challenges => challenges[n]))
	)

	return averagedResults;
}

// Returned promise may explictly reject if a test run throws or user code is invalid
export async function fitnessSuite(codeStr: string, preferWorker: boolean): Promise<TestRun[]> {
	if(!!Worker && preferWorker) {
		// Web workers are available, neat.
		try {
			// Chrome doesn't support { type: "module" } without a flag yet - so this will probably error for a while
			let w = new Worker("scripts/fitnessworker.js", { type: "module" });
			//let w = new Worker("scripts/fitnessworker.js", { type: "classic" });
			w.postMessage(codeStr);
			return new Promise<TestRun[]>((res, rej) => {
				w.onerror = e => {
					let wwErr = new Error('WebWorker failure');
					(wwErr as any).base = e;
					(window as any).lastErrorLol = wwErr;
					rej(wwErr);
				}
				w.onmessage = msg => {
					console.log("Got message from fitness worker", msg);
					if(Array.isArray(msg.data) && typeof msg.data[0] === "string") {
						let nerr = new Error();
						let [emsg, ename, estack] = msg.data;
						nerr.message = emsg;
						nerr.name = ename;
						nerr.stack = estack;
						rej(nerr); // Passthrough error
					} else if(Array.isArray(msg.data)) {
						res(msg.data); // Resolve with results
					} else {
						rej(new Error('Bad result from web worker!'));
					}
				};
			});
		} catch(e) {
			console.warn("Fitness worker creation failed, falling back to normal (error on next log entry):");
			console.warn(e);
		}
	}

	// Fall back do sync calculation without web worker
	return doFitnessSuite(codeStr, 2);
};
