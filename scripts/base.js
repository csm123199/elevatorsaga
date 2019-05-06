export const USERCODE_MODULE_NAME = 'UserCode';
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
function asDataURI(c) {
    // note: *not* unicode safe
    return 'data:text/javascript;base64,' + btoa(c);
}
export async function getCodeObjFromCode(code) {
    // Change the 'name' of the file so it doesn't appear as a giant base64 str in the stacktrace
    code += `\n\n//# sourceURL=${USERCODE_MODULE_NAME}.js`;
    let dataURI = asDataURI(code);
    let userModule = await import(dataURI);
    if (typeof userModule.init !== "function") {
        throw new TypeError("exported `init` is not a function! (has it been exported?)");
    }
    if (typeof userModule.update !== "function" && typeof userModule.update !== "undefined") {
        throw new TypeError("exported `update` is not a function!");
    }
    return userModule;
}
//# sourceMappingURL=base.js.map