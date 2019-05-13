

//import * as _ from 'lodash'
//declare const document: document;
declare const riot: typeof import('riot')
declare const _: typeof import('lodash')
import { getCodeObjFromCode, UserCodeObject, USERCODE_MODULE_NAME } from './base.js'
import { WorldController, WorldCreator, World } from './world.js'
import { Observable } from './observable.js';
import { challenges } from './challenges.js';
import { CodeEditor } from './editors/common.js';
import { CodeMirrorEditor } from './editors/codemirror.js';

const KEY_LOCAL_STORAGE = 'elevatorCrushCode_v5';
const KEY_TIMESCALE = "elevatorTimeScale";
interface HTMLTemplates {
	floor: string;
	elevator: string;
	elevatorbutton: string;
	user: string;
	challenge: string;
	feedback: string;
	codestatus: string;
}
interface PresentationElements {
	world: JQuery<HTMLElement>,
	stats: JQuery<HTMLElement>,
	feedback: JQuery<HTMLElement>,
	challenge: JQuery<HTMLElement>,
	codestatus: JQuery<HTMLElement>,
}

function createEditor(): CodeEditor {
	return new CodeMirrorEditor(document.getElementById("code") as HTMLTextAreaElement, KEY_LOCAL_STORAGE);
};

function createParamsUrl(current: Record<string, string>, overrides: Record<string, string>): string {
	return "#" + _.map(_.merge(current, overrides), function(val, key) {
		return key + "=" + val;
	}).join(",");
};



function getTemplates(): HTMLTemplates {
	let partialTempls: Partial<HTMLTemplates> = {}

	// note: use of TypeScript non-null assertion operator
	for(let templName of ['floor', 'elevator', 'elevatorbutton', 'user', 'challenge', 'feedback', 'codestatus'] as (keyof HTMLTemplates)[]) {
		let element = document.getElementById(templName + '-template');
		if(element === null)
			throw new Error(`Unable to get element #${templName}-template !`)
		partialTempls[templName] = element.innerHTML.trim();
	}

	// Safe cast since will throw if anything fails
	return partialTempls as HTMLTemplates;
}
function getPresentationElements(): PresentationElements {
	//const selectors: { [name: keyof PresentationElements]: string } = {
	const selectors: Record<keyof PresentationElements, string> = {
		world: 'innerworld',
		stats: 'statscontainer',
		feedback: 'feedbackcontainer',
		challenge: 'challenge',
		codestatus: 'codestatus',
	}
	const elements: Partial<PresentationElements> = {};
	for(let key in selectors) {
		elements[key] = $('.' + selectors[key])
		if(elements[key].length === 0)
			throw new Error(`Could not find HTML presentation element of class .${selectors[key]} !`)
	}
	return elements as PresentationElements;
}
class ElevatorSagaApp extends Observable {
	editor: CodeEditor;
	elements: PresentationElements;
	templates: HTMLTemplates;

	worldController: WorldController;
	worldCreator: WorldCreator;
	world?: World;
	currentChallengeIndex: number;

	constructor(editor: CodeEditor, elements: PresentationElements, templates: HTMLTemplates) {
		super();
		this.editor = editor;
		this.elements = elements;
		this.templates = templates;
		this.worldController = new WorldController(1.0 / 60.0);
		this.worldController.on("usercode_error", function(e) {
			console.log("World raised code error", e);
			editor.trigger("usercode_error", e);
		});
		
		console.log(this.worldController);
		this.worldCreator = new WorldCreator();
		this.world = undefined;
		this.currentChallengeIndex = 0;

		this.registerEditorEvents();
	}
	registerEditorEvents() {
		this.editor.on("apply_code", () => {
			this.startChallenge(this.currentChallengeIndex, true);
		});
		this.editor.on("code_success", () => {
			presentCodeStatus(this.elements.codestatus, this.templates.codestatus);
		});
		this.editor.on("usercode_error", (error) => {
			try {
				if(error instanceof Error && error.stack) {
					// Remove the auto-inserted Module. for the user code
					error.stack = error.stack.replace(/at Module\./g, `at `);
				}
				presentCodeStatus(this.elements.codestatus, this.templates.codestatus, error);
			} catch(e) {
				console.error('Error manipulating user-facing stacktrace!');
				console.error(e);
				presentCodeStatus(this.elements.codestatus, this.templates.codestatus, new Error("Internal game error."));
			}
		});
		this.editor.on("change", () => {
			$("#fitness_message").addClass("faded");
			var codeStr = this.editor.codeText;
			// fitnessSuite(codeStr, true, function(results) {
			//     var message = "";
			//     if(!results.error) {
			//         message = "Fitness avg wait times: " + _.map(results, function(r){ return r.options.description + ": " + r.result.avgWaitTime.toPrecision(3) + "s" }).join("&nbsp&nbsp&nbsp");
			//     } else {
			//         message = "Could not compute fitness due to error: " + results.error;
			//     }
			//     $("#fitness_message").html(message).removeClass("faded");
			// });
		});
		this.editor.trigger("change");
	}
	startStopOrRestart() {
		if(this.world!.challengeEnded) {
			this.startChallenge(this.currentChallengeIndex);
		} else {
			this.worldController.setPaused(!this.worldController.isPaused);
		}
	};

	async startChallenge(challengeIndex: number, autoStart?: boolean, params: Record<string, string> = {}): Promise<void> {
		if(typeof this.world !== "undefined") {
			this.world.unWind();
			// TODO: Investigate if memory leaks happen here
		}
		this.currentChallengeIndex = challengeIndex;
		this.world = this.worldCreator.createWorld(challenges[challengeIndex].options);
		(window as any).world = this.world;

		clearAll([this.elements.world, this.elements.feedback]);
		presentStats(this.elements.stats, this.world);
		presentChallenge(this.elements.challenge, challenges[challengeIndex], this, this.world, this.worldController, challengeIndex + 1, this.templates.challenge);
		presentWorld(this.elements.world, this.world, this.templates.floor, this.templates.elevator, this.templates.elevatorbutton, this.templates.user);

		this.worldController.on("timescale_changed", () => {
			localStorage.setItem(KEY_TIMESCALE, this.worldController.timeScale.toString());
			presentChallenge(this.elements.challenge, challenges[challengeIndex], this, this.world, this.worldController, challengeIndex + 1, this.templates.challenge);
		});

		this.world.on("stats_changed", () => {
			var challengeStatus = challenges[challengeIndex].condition.evaluate(this.world!);
			if(challengeStatus !== null) {
				this.world!.challengeEnded = true;
				this.worldController.setPaused(true);
				if(challengeStatus) {
					presentFeedback(this.elements.feedback, this.templates.feedback, this.world, "Success!", "Challenge completed", createParamsUrl(params, {
						challenge: (challengeIndex + 2).toString()
					}));
				} else {
					presentFeedback(this.elements.feedback, this.templates.feedback, this.world, "Challenge failed", "Maybe your program needs an improvement?", "");
				}
			}
		});

		try {
			const codeObj = await this.asModule();
			// This needs to be on the editor view...
			this.editor.trigger("code_success");

			console.log("Starting...");
			this.worldController.start(this.world!, codeObj, window.requestAnimationFrame, autoStart);
		} catch(e) {
			// This needs to be on the editor view...
			this.editor.trigger("usercode_error", e);
		}
	};
	async start(params: Record<string, string>) {
		let requestedChallenge = 0;
		let autoStart = false;
		// if getItem(tsKey) returns null, parseFloat returns NaN (falsy) so timeScale = 2.0
		let timeScale = parseFloat(localStorage.getItem(KEY_TIMESCALE)!) || 2.0;
		
		for(let [key, val] of Object.entries<string>(params)) {
			switch(key) {
				case "challenge":
					requestedChallenge = _.parseInt(val) - 1;
					if(requestedChallenge < 0 || requestedChallenge >= challenges.length) {
						console.log("Invalid challenge index", requestedChallenge);
						console.log("Defaulting to first challenge");
						requestedChallenge = 0;
					}
					break;
				case "autostart":
					// False by default, set to true if this key exists (and isn't `false`)
					autoStart = val === "false" ? false : true;
					break;
				case "timescale":
					timeScale = parseFloat(val);
					break;
				case "devtest":
					this.editor.codeText = $("#devtest-elev-implementation").text().trim();
					break;
				case "fullscreen":
					makeDemoFullscreen();
					break;
			}
		}

		this.worldController.setTimeScale(timeScale);
		return this.startChallenge(requestedChallenge, autoStart, params);
	}
	
	asModule(): Promise<UserCodeObject> {
		console.log("Getting code...");
		const codeStr = this.editor.codeText;
		return getCodeObjFromCode(codeStr);
	}
}
function onPageLoad() {
	var editor = createEditor();
	let app = new ElevatorSagaApp(editor, getPresentationElements(), getTemplates());

	const path = document.URL.includes('?') ? document.URL.split('?')[1] : ''
	const params = path.split(',').reduce((paramObj: Record<string, string>, pair: string) => {
		let match = pair.match(/(\w+)=(\w+$)/);
		if(match !== null) {
			let [whole, key, value] = match;
			paramObj[key] = value;
		}
		return paramObj;
	}, {});

	app.start(params)
}
$(onPageLoad);
