
import { Observable } from '../observable'

// Note: previously lodash function
export function debounce(cb: () => void, timeout_ms: number): () => void {
	let count = 0;
	
	return function debouncee() {
		count++;
		setTimeout(() => {
			count--;
			if(count === 0)
				cb();
		}, timeout_ms);
	}
}

export interface CodeEditor extends Observable {
	codeText: string;
	
	reset(): void;
	saveCode(): void;
	focus(): void;

	trigger(event: "change"): this;
	trigger(event: "apply_code"): this;
	trigger(event: "code_success"): this;
	trigger(event: "usercode_error", error: Error): this;

	on(event: "change", cb: () => void): this;
	on(event: "apply_code", cb: () => void): this;
	on(event: "code_success", cb: () => void): this;
	on(event: "usercode_error", cb: (error: Error) => void): this;
}

export abstract class CodeEditorBase extends Observable implements CodeEditor {
	/** Key used for local storage of code when saving */
	lsKey_save: string;
	lsKey_bckp: string;
	abstract codeText: string;

	constructor(localstorage_key_save: string, localstorage_key_reset: string = "develevateBackupCode") {
		super();
		this.lsKey_save = localstorage_key_save;
		this.lsKey_bckp = localstorage_key_reset;
	}

	protected init() {
		this.registerEventHandlers();
	}
	protected registerEventHandlers() {
		$("#button_save").click(() => {
			this.saveCode();
			this.focus();
		});
		$("#button_reset").click(() => {
			if(confirm("Do you really want to reset to the default implementation?")) {
				localStorage.setItem("develevateBackupCode", this.codeText);
				this.reset(false);
			}
			this.focus();
		});
		$("#button_resetundo").click(() => {
			if(confirm("Do you want to bring back the code as before the last reset?")) {
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
	reset(pushReset: boolean = true) {
		if(pushReset) this.lastReset = this.codeText;
		this.codeText = this.defaultText(false);
	}
	abstract focus();

	protected defaultText(allowSaved: boolean = true, devtest: boolean = false): string {
		if(allowSaved) {
			let saved = this.codeSaved;
			if(saved)
				return saved;
		}
		return $(`#${!devtest ? 'default' : 'devtest'}-elev-implementation`).text().trim();
	}

	protected get codeSaved(): string | null {
		return localStorage.getItem(this.lsKey_save);
	}
	protected set codeSaved(code: string | null) {
		if(code) localStorage.setItem(this.lsKey_save, code);
		else localStorage.removeItem(this.lsKey_save);
	}

	protected get lastReset(): string | null {
		return localStorage.getItem(this.lsKey_bckp);
	}
	protected set lastReset(code: string | null) {
		if(code) localStorage.setItem(this.lsKey_bckp, code);
		else localStorage.removeItem(this.lsKey_bckp);
	}
}
