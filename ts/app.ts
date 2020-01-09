

//import * as _ from 'lodash'
//declare const document: document;

//declare const riot: typeof import('./riot_types');
//@ts-ignore
import * as riot from './libs/riot.es6.js'

declare const _: typeof import('lodash')
import { getCodeObjFromCode, UserCodeObject, USERCODE_MODULE_NAME, objectFactory } from './base.js'
import { WorldController, WorldCreator, World } from './world.js'
import { Observable } from './observable.js';
import { challenges } from './challenges.js';
//import { fitnessSuite } from './fitness.js'
import { CodeEditor } from './editors/common.js';
import { CodeMirrorEditor } from './editors/codemirror.js';
import { MonacoEditor } from './editors/monaco.js';

// Note: type imports only here - code imports should be done dynamically through fitnessSuiteProm
//   Using dynamic imports so users should hopefully not have to download this module
import { TestRun } from './fitness.js';

const KEY_LOCAL_STORAGE = 'elevatorCrushCode_v5';
const KEY_TIMESCALE = "elevatorTimeScale";
const RUN_FITNESS_SUITE = true;

// NOP if fitness suite is false
let fitnessSuiteProm: null | Promise<(typeof import('./fitness.js').fitnessSuite)> = null;

async function fitnessSuite<T>(codeStr: string, preferWorker: boolean, cb: (testruns: TestRun[]) => Promise<T>): Promise<T | null> {
	if(!RUN_FITNESS_SUITE) return null;
	if(fitnessSuiteProm === null) {
		fitnessSuiteProm = import('./fitness.js').then(mod => mod.fitnessSuite);
	}

	return fitnessSuiteProm
		.then(fitnessSuite => fitnessSuite(codeStr, preferWorker))
		.then(testruns => cb(testruns));
}

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

namespace GameStartOptionsManager {
	export interface GameStartOptions {
		challengeIndex: number;
		autostart: boolean;
		timescale: number;
		fullscreen: boolean;
		devtest: boolean;
	}
}

class GameStartOptionsManager {
	private holder: GameStartOptionsManager.GameStartOptions;

	private static DEFAULT_OPTS = {
		challengeIndex: 0,
		autostart: false,
		timescale: 2,
		fullscreen: false,
		devtest: false,
	}

	constructor(opts?: Partial<GameStartOptionsManager.GameStartOptions>) {
		this.holder = { ...GameStartOptionsManager.DEFAULT_OPTS, ...opts };
	}
	static from(path: string): GameStartOptionsManager {
		// Turn 'stringified options' into a Record<string, string>
		// keys without a value have a value of ''
		const params: Record<string, string> = path.split('&').reduce((paramObj: Record<string, string>, pair: string) => {
			let match: RegExpMatchArray | null;
			if(match = pair.match(/(\w+)=(\w+$)/)) {
				let [whole, key, value] = match;
				paramObj[key] = value;
			} else if(match = pair.match(/(\w+)$/)) {
				let [whole, key] = match;
				paramObj[key] = '';
			} else {
				console.warn('Unknown key format: ' + pair);
			}
			return paramObj;
		}, {});
	
		const appStartOpts: Partial<GameStartOptionsManager.GameStartOptions> = {}
		
		{ // Start with timescale pre-filled from localStorage, if existing
			// if getItem(tsKey) returns null, parseFloat returns NaN, so null-assertion operator is safe
			let parsed = parseFloat(localStorage.getItem(KEY_TIMESCALE)!);
			if(Number.isFinite(parsed)) {
				appStartOpts.timescale = parsed;
			}
		}
		
		// Parse hash options into appStartOpts
		for(let [key, val] of Object.entries<string>(params)) {
			if(key === "challengeIndex") {
				let challengeIndex = Number.parseInt(val);
				if(!Number.isFinite(challengeIndex) || challengeIndex < 1 || challengeIndex > challenges.length) {
					console.warn("Invalid challenge index (Using default): ", challengeIndex);
				} else {
					appStartOpts.challengeIndex = challengeIndex;
				}
			} else if(key === "timescale") {
				let timescale = Number.parseFloat(val);
				if(!Number.isFinite(timescale) || timescale < 0) {
					console.warn("Invalid timescale value (Using default): ", timescale);
				} else {
					appStartOpts.timescale = timescale;
				}
			} else if(key === "autostart" || key === "devtest" || key === "fullscreen") {
				if(val !== '')
					console.warn('Boolean key/value pair had a non-empty value! Shouldn\'t exist if false, should have no value if true');
				
				appStartOpts[key] = true;
			} else {
				console.warn('Encountered invalid hash key/value pair: ', JSON.stringify({ [key]: val }));
			}
		}
	
		return new GameStartOptionsManager(appStartOpts)
	}
	toString() {
		// TODO: Is it our responsibility to prepend the hash?

		let optStrs: string[] = [];
		// push non-default keys into optStrs (this will later be reparsed in )
		//let key: keyof GameStartOptionsManager.GameStartOptions;
		let key: keyof GameStartOptionsManager.GameStartOptions;
		for(key in this.holder) {
			let value = this.holder[key];
			if(value !== GameStartOptionsManager.DEFAULT_OPTS[key]) {
				if(value === true) {
					optStrs.push(key);
				} else {
					optStrs.push(key + '=' + value.toString());
				}
			}
		}
		return '#' + optStrs.join('&');
	}
	copy(): GameStartOptionsManager {
		return new GameStartOptionsManager(this.holder);
	}

	// 'builder' style
	setChallengeIndex(val: number): this { this.holder.challengeIndex = val; return this; }
	setAutostart(val: boolean): this { this.holder.autostart = val; return this; }
	setTimescale(val: number): this { this.holder.timescale = val; return this; }
	setFullscreen(val: boolean): this { this.holder.fullscreen = val; return this; }
	setDevtest(val: boolean): this { this.holder.devtest = val; return this; }

	get challengeIndex(): number { return this.holder.challengeIndex; }
	get autostart(): boolean { return this.holder.autostart; }
	get timescale(): number { return this.holder.timescale; }
	get fullscreen(): boolean { return this.holder.fullscreen; }
	get devtest(): boolean { return this.holder.devtest; }

	set challengeIndex(val: number) { this.holder.challengeIndex = val; }
	set autostart(val: boolean) { this.holder.autostart = val; }
	set timescale(val: number) { this.holder.timescale = val; }
	set fullscreen(val: boolean) { this.holder.fullscreen = val; }
	set devtest(val: boolean) { this.holder.devtest = val; }
}


function createEditor(kind: "codemirror" | "monaco"): CodeEditor {
	if(kind === 'codemirror') {
		document.getElementById('code-monaco')!.hidden = true;
		return new CodeMirrorEditor(document.getElementById("code") as HTMLTextAreaElement, KEY_LOCAL_STORAGE);
	} else if(kind === 'monaco') {
		document.getElementById('code')!.hidden = true;
		return new MonacoEditor(document.getElementById("code-monaco")!, KEY_LOCAL_STORAGE);
	} else {
		throw new Error('Unknown editor type! (' + kind + ')')
	}
};

function getTemplates(): HTMLTemplates {
	let names: (keyof HTMLTemplates)[] = ['floor', 'elevator', 'elevatorbutton', 'user', 'challenge', 'feedback', 'codestatus'];
	return objectFactory<HTMLTemplates>(names, key => {
		let element = document.getElementById(key + '-template');
		if(element === null)
			throw new Error(`Unable to get element #${key}-template !`);
		return element.innerHTML.trim();
	});
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
		this.worldController.on("usercode_error", (e: Error) => {
			console.warn("World raised code error", e);
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
			this.startChallenge(new GameStartOptionsManager({
				challengeIndex: this.currentChallengeIndex,
				autostart: true,
			}));
		});
		this.editor.on("code_success", () => {
			presentCodeStatus(this.elements.codestatus, this.templates.codestatus);
		});
		this.editor.on("usercode_error", (error: Error) => {
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
			fitnessSuite(codeStr, true, async (ptestruns) => {
				let msg;
				try {
					msg = "Fitness avg wait times: " + ptestruns
						.map((r) => r.options.description + ": " + r.result.avgWaitTime.toPrecision(3) + "s")
						.join("&nbsp".repeat(3));
				} catch(e) {
					msg = "Could not compute fitness due to error: " + e.toString();
				}
				$("#fitness_message").html(msg).removeClass("faded");
			});
		});
		this.editor.trigger("change");
	}
	startStopOrRestart() { // Called in presenters.js
		if(this.world!.challengeEnded) {
			this.startChallenge(new GameStartOptionsManager({
				challengeIndex: this.currentChallengeIndex,
			}));
		} else {
			this.worldController.setPaused(!this.worldController.isPaused);
		}
	};

	async startChallenge(appStartOpts: GameStartOptionsManager): Promise<void> {
		const authOpts = appStartOpts;
		const challengeIndex = authOpts.challengeIndex;
		const autoStart = authOpts.autostart;

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
					presentFeedback(
						this.elements.feedback,
						this.templates.feedback,
						this.world,
						"Success!",
						"Challenge completed",
						appStartOpts.copy().setChallengeIndex(challengeIndex + 1),
					);
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
	async start(appStartOpts: GameStartOptionsManager) {
		this.worldController.setTimeScale(appStartOpts.timescale);
		return this.startChallenge(appStartOpts);
	}
	
	asModule(): Promise<UserCodeObject> {
		console.log("Getting code...");
		const codeStr = this.editor.codeText;
		return getCodeObjFromCode(codeStr);
	}
}
function onPageLoad() {
	var editor = createEditor('monaco');
	let app = new ElevatorSagaApp(editor, getPresentationElements(), getTemplates());

	(riot as any).route((path: string) => {
		// Remove the starting hash (to make the option parser not have to care about it)
		if(path.startsWith('#')) path = path.slice(1);

		app.start(GameStartOptionsManager.from(path));
	});
}
$(onPageLoad);
