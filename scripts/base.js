export function random(max, inclusive = true) {
    return Math.floor(Math.random() * (max + (inclusive ? 1 : 0)));
}
export function randomRange(min, max, inclusive = true) {
    return min + Math.floor(Math.random() * (max - min + (inclusive ? 1 : 0)));
}
export function limitNumber(num, min, max) {
    return Math.min(max, Math.max(num, min));
}
;
export function epsilonEquals(a, b) {
    return Math.abs(a - b) < 0.00000001;
}
;
export function deprecationWarning(name) {
    console.warn("You are using a deprecated feature scheduled for removal: " + name);
}
;
/** Ensures `obj` is an instanceof the prototype `type` */
export function newGuard(obj, type) {
    if (!(obj instanceof type)) {
        throw "Incorrect instantiation, got " + typeof obj + " but expected " + type;
    }
}
;
// Returns function to set/get bool `obj[objPropertyName]` and (if setting) return `owner` otherwise return `obj[objPropertyName]
export function createBoolPassthroughFunction(host, owner, prop) {
    function getter_setter(val) {
        if (val === undefined) { // Getter
            // Can't figure out the proper typing so just suppressing the type check, since the signature is valid anyway
            //@ts-ignore
            return owner[prop];
        }
        else { // Setter
            //@ts-ignore
            owner[prop] = val;
            return host;
        }
    }
    return getter_setter;
}
export function distanceNeededToAchieveSpeed(currentSpeed, targetSpeed, acceleration) {
    // v² = u² + 2a * d
    let requiredDistance = (Math.pow(targetSpeed, 2) - Math.pow(currentSpeed, 2)) / (2 * acceleration);
    return requiredDistance;
}
;
export function accelerationNeededToAchieveChangeDistance(currentSpeed, targetSpeed, distance) {
    // v² = u² + 2a * d
    let requiredAcceleration = 0.5 * ((Math.pow(targetSpeed, 2) - Math.pow(currentSpeed, 2)) / distance);
    return requiredAcceleration;
}
;
// Fake frame requester helper used for testing and fitness simulations
function createFrameRequester(timeStep) {
    let currentCb = null;
    let requester = {
        currentT: 0.0,
        register: function (cb) {
            currentCb = cb;
        },
        trigger: function () {
            requester.currentT += timeStep;
            if (currentCb !== null) {
                currentCb(requester.currentT);
            }
        }
    };
    return requester;
}
;
export function getCodeObjFromCode(code) {
    if (code.trim().substr(0, 1) == "{" && code.trim().substr(-1, 1) == "}") {
        code = "(" + code + ")";
    }
    /* jslint evil:true */
    let obj = eval(code);
    /* jshint evil:false */
    if (typeof obj.init !== "function") {
        throw "Code must contain an init function";
    }
    if (typeof obj.update !== "function") {
        throw "Code must contain an update function";
    }
    return obj;
}
//# sourceMappingURL=base.js.map