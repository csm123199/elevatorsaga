importScripts("libs/lodash.min.js", "libs/riot.js", "libs/unobservable.js")
importScripts("scripts/base.js", "scripts/movable.js", "scripts/floor.js", "scripts/user.js", "scripts/elevator.js", "scripts/interfaces.js", "scripts/world.js", "scripts/fitness.js");


onmessage = function(msg) {
	// Assume it is a code object that should be fitness-tested
	var codeStr = msg.data;
	var results = doFitnessSuite(codeStr, 6);
	console.log("Posting message back", results);
	postMessage(results);
};
