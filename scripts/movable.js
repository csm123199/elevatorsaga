import { Observable } from './observable.js';
const EPSILON = 0.00001;
export function linearInterpolate(value0, value1, x) {
    return value0 + (value1 - value0) * x;
}
export function powInterpolate(value0, value1, x, a) {
    return value0 + (value1 - value0) * Math.pow(x, a) / (Math.pow(x, a) + Math.pow(1 - x, a));
}
export function coolInterpolate(value0, value1, x) {
    return powInterpolate(value0, value1, x, 1.3);
}
export let DEFAULT_INTERPOLATOR = coolInterpolate;
const _tmpPosStorage = [0, 0];
export class Movable extends Observable {
    constructor() {
        super();
        this.movable = this;
        this.x = 0.0;
        this.y = 0.0;
        this.parent = null;
        this.worldX = 0.0;
        this.worldY = 0.0;
        this.currentTask = null;
        this.trigger('new_state', this);
    }
    updateDisplayPosition(forceTrigger) {
        this.getWorldPosition(_tmpPosStorage);
        var oldX = this.worldX;
        var oldY = this.worldY;
        this.worldX = _tmpPosStorage[0];
        this.worldY = _tmpPosStorage[1];
        if (oldX !== this.worldX || oldY !== this.worldY || forceTrigger === true) {
            this.trigger('new_display_state', this);
        }
    }
    moveTo(newX, newY) {
        if (newX !== null) {
            this.x = newX;
        }
        if (newY !== null) {
            this.y = newY;
        }
        this.trigger("new_state", this);
    }
    moveToFast(newX, newY) {
        this.x = newX;
        this.y = newY;
        this.trigger("new_state", this);
    }
    isBusy() {
        return this.currentTask !== null;
    }
    makeSureNotBusy() {
        if (this.isBusy()) {
            console.error("Attempt to use movable while it was busy", this);
            throw ({ message: "Object is busy - you should use callback", obj: this });
        }
    }
    wait(millis, cb) {
        this.makeSureNotBusy();
        let timeSpent = 0.0;
        const waitTask = (dt) => {
            timeSpent += dt;
            if (timeSpent > millis) {
                this.currentTask = null;
                if (cb) {
                    cb();
                }
            }
        };
        this.currentTask = waitTask;
    }
    ;
    moveToOverTime(newX, newY, timeToSpend, interpolator, cb) {
        this.makeSureNotBusy();
        const interpolatorfn = interpolator === undefined ? DEFAULT_INTERPOLATOR : interpolator;
        const nextX = newX !== null ? newX : this.x;
        const nextY = newY !== null ? newY : this.y;
        const origX = this.x;
        const origY = this.y;
        let timeSpent = 0.0;
        const moveToOverTimeTask = (dt) => {
            timeSpent = Math.min(timeToSpend, timeSpent + dt);
            if (timeSpent === timeToSpend) { // Epsilon issues possibly?
                this.moveToFast(nextX, nextY);
                this.currentTask = null;
                if (cb) {
                    cb();
                }
            }
            else {
                const factor = timeSpent / timeToSpend;
                this.moveToFast(interpolatorfn(origX, nextX, factor), interpolatorfn(origY, nextY, factor));
            }
        };
        this.currentTask = moveToOverTimeTask;
    }
    ;
    update(deltaTime) {
        if (this.currentTask !== null) {
            this.currentTask(deltaTime);
        }
    }
    ;
    getWorldPosition(storage) {
        let { x, y } = this;
        var currentParent = this.parent;
        while (currentParent !== null) {
            x += currentParent.x;
            y += currentParent.y;
            currentParent = currentParent.parent;
        }
        storage[0] = x;
        storage[1] = y;
    }
    ;
    setParent(movableParent) {
        let objWorld = [0, 0];
        if (movableParent === null) {
            if (this.parent !== null) {
                this.getWorldPosition(objWorld);
                this.parent = null;
                this.moveToFast(objWorld[0], objWorld[1]);
            }
        }
        else {
            // Parent is being set a non-null movable
            this.getWorldPosition(objWorld);
            let parentWorld = [0, 0];
            movableParent.getWorldPosition(parentWorld);
            this.parent = movableParent;
            this.moveToFast(objWorld[0] - parentWorld[0], objWorld[1] - parentWorld[1]);
        }
    }
}
//# sourceMappingURL=movable.js.map