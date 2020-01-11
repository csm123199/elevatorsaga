import { Observable } from '../observable.js';
export function debounce(cb, timeout_ms) {
    let count = 0;
    return function debouncee() {
        count++;
        setTimeout(() => {
            count--;
            if (count === 0)
                cb();
        }, timeout_ms);
    };
}
export class CodeEditorBase extends Observable {
    constructor(localstorage_key_save, localstorage_key_reset = "develevateBackupCode") {
        super();
        this.lsKey_save = localstorage_key_save;
        this.lsKey_bckp = localstorage_key_reset;
    }
    init() {
        this.registerEventHandlers();
    }
    registerEventHandlers() {
        $("#button_save").click(() => {
            this.saveCode();
            this.focus();
        });
        $("#button_reset").click(() => {
            if (confirm("Do you really want to reset to the default implementation?")) {
                localStorage.setItem("develevateBackupCode", this.codeText);
                this.reset(false);
            }
            this.focus();
        });
        $("#button_resetundo").click(() => {
            if (confirm("Do you want to bring back the code as before the last reset?")) {
                this.codeText = this.lastReset || "";
            }
            this.focus();
        });
        $("#button_apply").click(() => {
            this.trigger("apply_code");
        });
    }
    saveCode() {
        this.codeSaved = this.codeText;
        $("#save_message").text("Code saved " + new Date().toTimeString());
    }
    reset(pushReset = true) {
        if (pushReset)
            this.lastReset = this.codeText;
        this.codeText = this.defaultText(false);
    }
    defaultText(allowSaved = true, devtest = false) {
        if (allowSaved) {
            let saved = this.codeSaved;
            if (saved)
                return saved;
        }
        return $(`#${!devtest ? 'default' : 'devtest'}-elev-implementation`).text().trim();
    }
    get codeSaved() {
        return localStorage.getItem(this.lsKey_save);
    }
    set codeSaved(code) {
        if (code)
            localStorage.setItem(this.lsKey_save, code);
        else
            localStorage.removeItem(this.lsKey_save);
    }
    get lastReset() {
        return localStorage.getItem(this.lsKey_bckp);
    }
    set lastReset(code) {
        if (code)
            localStorage.setItem(this.lsKey_bckp, code);
        else
            localStorage.removeItem(this.lsKey_bckp);
    }
}
//# sourceMappingURL=common.js.map