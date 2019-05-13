
declare const CodeMirror: typeof import('codemirror')
import { Observable } from '../observable.js'
import { CodeEditor } from './common.js'

function debounce(cb: () => void, timeout_ms: number): () => void {
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

export class CodeMirrorEditor extends Observable implements CodeEditor {
	cm: CodeMirror.EditorFromTextArea;
	/** Key used for local storage of code when saving */
	lsKey: string;

	constructor(hostElement: HTMLTextAreaElement, lsKey: string) {
		super();
		this.lsKey = lsKey;
		this.cm = CodeMirror.fromTextArea(hostElement, {
			lineNumbers: true,
			indentUnit: 4,
			indentWithTabs: false,
			theme: "solarized light",
			mode: "javascript",
			// @ts-ignore
			autoCloseBrackets: true,
			extraKeys: {
				// the following Tab key mapping is from http://codemirror.net/doc/manual.html#keymaps
				Tab: cm => {
					var spaces = new Array(cm.getOption("indentUnit") + 1).join(" ");
					// @ts-ignore
					cm.replaceSelection(spaces);
				}
			}
		});

		// reindent on paste (adapted from https://github.com/ahuth/brackets-paste-and-indent/blob/master/main.js)
		this.cm.on("change", function(codeMirror, change) {
			if(change.origin !== "paste") {
				return;
			}
	
			var lineFrom = change.from.line;
			var lineTo = change.from.line + change.text.length;
	
			function reindentLines(codeMirror, lineFrom, lineTo) {
				codeMirror.operation(function() {
					codeMirror.eachLine(lineFrom, lineTo, function(lineHandle) {
						codeMirror.indentLine(lineHandle.lineNo(), "smart");
					});
				});
			}
	
			reindentLines(codeMirror, lineFrom, lineTo);
		});

		var existingCode = this.codeSaved;
		if(existingCode) {
			this.codeText = existingCode
		} else {
			this.reset();
		}

		$("#button_save").click(() => {
			this.saveCode();
			this.focus();
		});
		$("#button_reset").click(() => {
			if(confirm("Do you really want to reset to the default implementation?")) {
				localStorage.setItem("develevateBackupCode", this.codeText);
				this.reset();
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

		const autoSaver = debounce(() => this.saveCode(), 1000);
		this.cm.on("change", autoSaver);
	}

	get codeText() {
		return this.cm.getValue();
	}
	set codeText(text: string) {
		this.cm.setValue(text);
	}

	reset() {
		this.codeText = $("#default-elev-implementation").text().trim();
	}
	saveCode() {
		this.codeSaved = this.codeText;
		$("#save_message").text("Code saved " + new Date().toTimeString());
		this.trigger("change");
	}
	focus() {
		this.cm.focus();
	}

	protected get codeSaved(): string | null {
		return localStorage.getItem(this.lsKey);
	}
	protected set codeSaved(code: string | null) {
		if(code)
			localStorage.setItem(this.lsKey, code);
		else
			localStorage.removeItem(this.lsKey)
		
	}

	protected get lastReset(): string | null {
		return localStorage.getItem("develevateBackupCode");
	}
	protected set lastReset(code: string | null) {
		if(code)
			localStorage.setItem("develevateBackupCode", code);
		else
			localStorage.removeItem("develevateBackupCode")
	}
}
