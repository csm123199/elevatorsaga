// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"UqjH":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.doFitnessSuite = doFitnessSuite;
exports.fitnessSuite = fitnessSuite;

var _base = require("./base");

var _world = require("./world");

function requireNothing() {
  return {
    description: "No requirement",
    evaluate: function () {
      return null;
    }
  };
}

;
const fitnessChallenges = [{
  options: {
    description: "Small scenario",
    floorCount: 4,
    elevatorCount: 2,
    spawnRate: 0.6
  },
  condition: requireNothing()
}, {
  options: {
    description: "Medium scenario",
    floorCount: 6,
    elevatorCount: 3,
    spawnRate: 1.5,
    elevatorCapacities: [5]
  },
  condition: requireNothing()
}, {
  options: {
    description: "Large scenario",
    floorCount: 18,
    elevatorCount: 6,
    spawnRate: 1.9,
    elevatorCapacities: [8]
  },
  condition: requireNothing()
}]; // Simulation without visualisation

function calculateFitness(challenge, codeObj, stepSize, stepsToSimulate) {
  const controller = new _world.WorldController(stepSize);
  let result = null;
  const worldCreator = new _world.WorldCreator();
  const world = worldCreator.createWorld(challenge.options);
  const frameRequester = (0, _base.createFrameRequester)(stepSize);
  controller.on("usercode_error", e => {
    result = e;
  });
  world.on("stats_changed", () => {
    result = {
      transportedPerSec: world.transportedPerSec,
      avgWaitTime: world.avgWaitTime,
      transportedCount: world.transportedCounter
    };
  });
  controller.start(world, codeObj, frameRequester.register, true);

  for (let stepCount = 0; stepCount < stepsToSimulate && !controller.isPaused; stepCount++) {
    frameRequester.trigger();
  } // Ignore type checkers insistance that the two callbacks aren't called during the execution flow


  result = result;

  if (result === null) {
    throw new Error('Recieved null result from fitness test...');
  } else if (result instanceof Error) {
    throw result;
  } else {
    return result;
  }
}

;

const pluck = (obj, key) => obj.map(v => v[key]);

function makeAverageResult(results) {
  let fitnessKeys = ["transportedPerSec", "avgWaitTime", "transportedCount"];
  let averagedResult = (0, _base.objectFactory)(fitnessKeys, k => {
    var sum = results.map(v => v.result[k]).reduce((acc, v) => acc + v);
    return sum / results.length;
  });
  return {
    options: results[0].options,
    result: averagedResult
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

async function doFitnessSuite(codeStr, runCount) {
  // Can throw, allow to bubble up
  let codeObj = await (0, _base.getCodeObjFromCode)(codeStr);
  console.log("Fitness testing code", codeObj); // testruns[runCount][fitnessChallenges.length]
  // Can throw, allow to bubble up

  const testruns = times(runCount, () => // Run runCount times
  fitnessChallenges.map(challenge => ({
    options: challenge.options,
    result: calculateFitness(challenge, codeObj, 1000.0 / 60.0, 12000)
  }))); // Now do averaging over all properties for each challenge's test runs

  const averagedResults = times(testruns[0].length, n => makeAverageResult(testruns.map(challenges => challenges[n])));
  return averagedResults;
} // Returned promise may explictly reject if a test run throws or user code is invalid


async function fitnessSuite(codeStr, preferWorker) {
  if (!!Worker && preferWorker) {
    // Web workers are available, neat.
    try {
      // Chrome doesn't support { type: "module" } without a flag yet - so this will probably error for a while
      let w = new Worker("scripts/fitnessworker.js", {
        type: "module"
      }); //let w = new Worker("scripts/fitnessworker.js", { type: "classic" });

      w.postMessage(codeStr);
      return new Promise((res, rej) => {
        w.onerror = e => {
          let wwErr = new Error('WebWorker failure');
          wwErr.base = e;
          window.lastErrorLol = wwErr;
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
          } else if (Array.isArray(msg.data)) {
            res(msg.data); // Resolve with results
          } else {
            rej(new Error('Bad result from web worker!'));
          }
        };
      });
    } catch (e) {
      console.warn("Fitness worker creation failed, falling back to normal (error on next log entry):");
      console.warn(e);
    }
  } // Fall back do sync calculation without web worker


  return doFitnessSuite(codeStr, 2);
}

;
},{"./base":"v5cZ","./world":"XLY6"}]},{},[], null)
//# sourceMappingURL=/fitness.a44099ed.js.map