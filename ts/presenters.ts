
import * as riot from './libs/riot.es6.js'
//import observable from '@riotjs/observable'
declare const _: typeof import('lodash')
import { ElevatorSagaApp, HTMLTemplates } from './app.js';
import { World, WorldController } from './world.js';
import { Challenge } from './challenges.js';

function setTransformPos(elem, x, y) {
	let style = "translate(" + x + "px," + y + "px) translateZ(0)";
	elem.style.transform = style;
	elem.style["-ms-transform"] = style;
	elem.style["-webkit-transform"] = style;
};
function updateUserState($user, elem_user, user) {
	setTransformPos(elem_user, user.worldX, user.worldY);
	if(user.done) { $user.addClass("leaving"); }
};
function makeDemoFullscreen() {
	$("body .container > *").not(".world").css("visibility", "hidden");
	$("html, body, body .container, .world").css({width: "100%", margin: "0", "padding": 0});
};

export function clearAll<T extends JQuery<HTMLElement>>($elems: T[]) {
	$elems.forEach($elem => $elem.empty());
};

export function presentStats($parent: JQuery<HTMLElement>, world: World) {

	let elem_transportedcounter = $parent.find(".transportedcounter").get(0);
	let elem_elapsedtime = $parent.find(".elapsedtime").get(0);
	let elem_transportedpersec = $parent.find(".transportedpersec").get(0);
	let elem_avgwaittime = $parent.find(".avgwaittime").get(0);
	let elem_maxwaittime = $parent.find(".maxwaittime").get(0);
	let elem_movecount = $parent.find(".movecount").get(0);

	world.on("stats_display_changed", function updateStats() {
		elem_transportedcounter.textContent = world.transportedCounter.toString();
		elem_elapsedtime.textContent = world.elapsedTime.toFixed(0) + "s";
		elem_transportedpersec.textContent = world.transportedPerSec.toPrecision(3);
		elem_avgwaittime.textContent = world.avgWaitTime.toFixed(1) + "s";
		elem_maxwaittime.textContent = world.maxWaitTime.toFixed(1) + "s";
		elem_movecount.textContent = world.moveCount.toString();
	});
	world.trigger("stats_display_changed");
};

export function presentChallenge($parent: JQuery<HTMLElement>, challenge: Challenge, app: ElevatorSagaApp, world: World, worldController: WorldController, challengeNum: number, challengeTempl: HTMLTemplates['challenge']) {
	let $challenge = $(riot.render(challengeTempl, {
		challenge: challenge,
		num: challengeNum,
		timeScale: worldController.timeScale.toFixed(0) + "x",
		startButtonText: world.challengeEnded ? "<i class='fa fa-repeat'></i> Restart" : (worldController.isPaused ? "Start" : "Pause")
	}));
	$parent.html($challenge as any);

	$parent.find(".startstop").on("click", function() {
		app.startStopOrRestart();
	});
	$parent.find(".timescale_increase").on("click", function(e) {
		e.preventDefault();
		if(worldController.timeScale < 40) {
			var timeScale = Math.round(worldController.timeScale * 1.618);
			worldController.setTimeScale(timeScale);
		}
	});
	$parent.find(".timescale_decrease").on("click", function(e) {
		e.preventDefault();
		var timeScale = Math.round(worldController.timeScale / 1.618);
		worldController.setTimeScale(timeScale);
	});
};

export function presentFeedback($parent, feedbackTempl, world, title, message, url) {
	$parent.html(riot.render(feedbackTempl, {title: title, message: message, url: url, paddingTop: world.floors.length * world.floorHeight * 0.2}));
	if(!url) {
		$parent.find("a").remove();
	}
};

export function presentWorld($world, world, floorTempl, elevatorTempl, elevatorButtonTempl, userTempl) {
	$world.css("height", world.floorHeight * world.floors.length);

	$world.append(_.map(world.floors, function(f) {
		var $floor = $(riot.render(floorTempl, f));
		var $up = $floor.find(".up");
		var $down = $floor.find(".down");
		f.on("buttonstate_change", function(buttonStates) {
			$up.toggleClass("activated", buttonStates.up !== "");
			$down.toggleClass("activated", buttonStates.down !== "");
		});
		$up.on("click", function() {
			f.pressUpButton();
		});
		$down.on("click", function() {
			f.pressDownButton();
		});
		return $floor;
	}));
	$world.find(".floor").first().find(".down").addClass("invisible");
	$world.find(".floor").last().find(".up").addClass("invisible");

	function renderElevatorButtons(states) {
		// This is a rarely executed inner-inner loop, does not need efficiency
		return _.map(states, function(b, i) {
			return riot.render(elevatorButtonTempl, {floorNum: i});
		}).join("");
	};

	function setUpElevator(e) {
		var $elevator = $(riot.render(elevatorTempl, {e: e}));
		var elem_elevator = $elevator.get(0);
		$elevator.find(".buttonindicator").html(renderElevatorButtons(e.buttonStates));
		var $buttons = _.map($elevator.find(".buttonindicator").children(), function(c) { return $(c); });
		var elem_floorindicator = $elevator.find(".floorindicator > span").get(0);

		$elevator.on("click", ".buttonpress", function() {
			e.pressFloorButton(parseInt($(this).text()));
		});
		e.on("new_display_state", function updateElevatorPosition() {
			setTransformPos(elem_elevator, e.worldX, e.worldY);
		});
		e.on("new_current_floor", function update_current_floor(floor) {
			elem_floorindicator.textContent = floor;
		});
		e.on("floor_buttons_changed", function update_floor_buttons(states, indexChanged) {
			$buttons[indexChanged].toggleClass("activated", states[indexChanged]);
		});
		e.on("indicatorstate_change", function indicatorstate_change(indicatorStates) {
			$elevator.find(".up").toggleClass("activated", indicatorStates.up);
			$elevator.find(".down").toggleClass("activated", indicatorStates.down);
		});
		e.trigger("new_state", e);
		e.trigger("new_display_state", e);
		e.trigger("new_current_floor", e.currentFloor);
		return $elevator;
	}

	$world.append(_.map(world.elevators, function(e) {
		return setUpElevator(e);
	}));

	world.on("new_user", function(user) {
		var $user = $(riot.render(userTempl, {u: user, state: user.done ? "leaving" : ""}));
		var elem_user = $user.get(0);

		user.on("new_display_state", function() { updateUserState($user, elem_user, user); })
		user.on("removed", function() {
			$user.remove();
		});
		$world.append($user);
	});
};

export function presentCodeStatus($parent: JQuery<HTMLElement>, templ: string, error?: Error | string) {
	if (error) console.warn('Code had an error: ', error);

	let errorDisplay = error ? "block" : "none";
	let successDisplay = error ? "none" : "block";
	let errorMessage: string = error instanceof Error ? (error.stack != null ? error.stack : error.message) : (error != null ? error : '');

	// Use the brower's mechanisms to escape the user data
	let dummyTag = document.createElement("div");
	dummyTag.textContent = errorMessage;
	errorMessage = dummyTag.innerHTML;

	errorMessage = errorMessage.replace(/\n/g, "<br>"); // Keep newline for debugging readability
	errorMessage = errorMessage.replace(/(\n|<br>|^)( +)/g, (match, newline_specifier, spaces) =>
		newline_specifier + "&nbsp;".repeat(spaces.length*2)
	);
	let rendered = riot.render(templ, { errorMessage, errorDisplay, successDisplay });
	$parent.html(rendered); // $parent[0].innerHTML = rendered
};
