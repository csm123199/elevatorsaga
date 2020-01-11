import { getCodeObjFromCode, createFrameRequester, objectFactory } from './base.js';
import { WorldController, WorldCreator } from './world.js';
function requireNothing() {
    return {
        description: "No requirement",
        evaluate: function () { return null; }
    };
}
;
const fitnessChallenges = [
    { options: { description: "Small scenario", floorCount: 4, elevatorCount: 2, spawnRate: 0.6 }, condition: requireNothing() },
    { options: { description: "Medium scenario", floorCount: 6, elevatorCount: 3, spawnRate: 1.5, elevatorCapacities: [5] }, condition: requireNothing() },
    { options: { description: "Large scenario", floorCount: 18, elevatorCount: 6, spawnRate: 1.9, elevatorCapacities: [8] }, condition: requireNothing() }
];
// Simulation without visualisation
function calculateFitness(challenge, codeObj, stepSize, stepsToSimulate) {
    const controller = new WorldController(stepSize);
    let result = null;
    const worldCreator = new WorldCreator();
    const world = worldCreator.createWorld(challenge.options);
    const frameRequester = createFrameRequester(stepSize);
    controller.on("usercode_error", (e) => {
        result = e;
    });
    world.on("stats_changed", () => {
        result = {
            transportedPerSec: world.transportedPerSec,
            avgWaitTime: world.avgWaitTime,
            transportedCount: world.transportedCounter,
        };
    });
    controller.start(world, codeObj, frameRequester.register, true);
    for (let stepCount = 0; stepCount < stepsToSimulate && !controller.isPaused; stepCount++) {
        frameRequester.trigger();
    }
    // Ignore type checkers insistance that the two callbacks aren't called during the execution flow
    result = result;
    if (result === null) {
        throw new Error('Recieved null result from fitness test...');
    }
    else if (result instanceof Error) {
        throw result;
    }
    else {
        return result;
    }
}
;
const pluck = (obj, key) => obj.map(v => v[key]);
function makeAverageResult(results) {
    let fitnessKeys = ["transportedPerSec", "avgWaitTime", "transportedCount"];
    let averagedResult = objectFactory(fitnessKeys, (k) => {
        var sum = results
            .map(v => v.result[k])
            .reduce((acc, v) => acc + v);
        return sum / results.length;
    });
    return {
        options: results[0].options,
        result: averagedResult,
    };
}
;
function times(count, iteratee) {
    const elements = [];
    for (let i = 0; i < count; i++) {
        elements.push(iteratee(i));
    }
    return elements;
}
export async function doFitnessSuite(codeStr, runCount) {
    // Can throw, allow to bubble up
    let codeObj = await getCodeObjFromCode(codeStr);
    console.log("Fitness testing code", codeObj);
    // testruns[runCount][fitnessChallenges.length]
    // Can throw, allow to bubble up
    const testruns = times(runCount, () => // Run runCount times
     fitnessChallenges.map(challenge => ({
        options: challenge.options,
        result: calculateFitness(challenge, codeObj, 1000.0 / 60.0, 12000)
    })));
    // Now do averaging over all properties for each challenge's test runs
    const averagedResults = times(testruns[0].length, (n) => makeAverageResult(testruns.map(challenges => challenges[n])));
    return averagedResults;
}
// Returned promise may explictly reject if a test run throws or user code is invalid
export async function fitnessSuite(codeStr, preferWorker) {
    if (!!Worker && preferWorker) {
        // Web workers are available, neat.
        try {
            // Chrome doesn't support { type: "module" } without a flag yet - so this will probably error for a while
            let w = new Worker("scripts/fitnessworker.js", { type: "module" });
            //let w = new Worker("scripts/fitnessworker.js", { type: "classic" });
            w.postMessage(codeStr);
            return new Promise((res, rej) => {
                w.onerror = e => {
                    let wwErr = new Error('WebWorker failure');
                    wwErr.base = e;
                    rej(wwErr);
                };
                w.onmessage = msg => {
                    console.log("Got message from fitness worker", msg);
                    if (Array.isArray(msg.data) && typeof msg.data[0] === "string") {
                        let nerr = new Error();
                        let [emsg, ename, estack] = msg.data;
                        nerr.message = emsg;
                        nerr.name = ename;
                        nerr.stack = estack;
                        rej(nerr); // Passthrough error
                    }
                    else if (Array.isArray(msg.data)) {
                        res(msg.data); // Resolve with results
                    }
                    else {
                        rej(new Error('Bad result from web worker!'));
                    }
                };
            });
        }
        catch (e) {
            console.warn("Fitness worker creation failed, falling back to normal (error on next log entry):");
            console.warn(e);
        }
    }
    // Fall back do sync calculation without web worker
    return doFitnessSuite(codeStr, 2);
}
;
//# sourceMappingURL=fitness.js.map