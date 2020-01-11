

//@ts-ignore
//self.importScripts("libs/lodash.min.js", "libs/riot.js", "libs/unobservable.js")
//self.importScripts("scripts/base.js", "scripts/movable.js", "scripts/floor.js", "scripts/user.js", "scripts/elevator.js", "scripts/interfaces.js", "scripts/world.js", "scripts/fitness.js");



import { doFitnessSuite } from './fitness.js'
//declare var self: DedicatedWorkerGlobalScope;

self.onmessage = async function(this: WindowEventHandlers, msg: MessageEvent) {
	console.log('Running from web worker!');

	// Assume it is a code object that should be fitness-tested
	var codeStr = msg.data;
	try {
		//@ts-ignore
		var results = await doFitnessSuite(codeStr, 6);
		console.log("Posting message back", results);
		//@ts-ignore
		self.postMessage(results, { targetOrigin: msg.origin });
	} catch(e) { // from await'd promise
		console.log("Posting error message back", e.toString());
		if(e instanceof Error)
			//self.postMessage([e.message, e.name, e.stack], msg.origin);
			//@ts-ignore
			self.postMessage([e.message, e.name, e.stack], { targetOrigin: msg.origin });
		else
			//@ts-ignore
			self.postMessage('Caught Error: ' + e.toString(), { targetOrigin: msg.origin });
	}
};
