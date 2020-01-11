import { CodeEditorBase, debounce } from './common.js';
export class CodeMirrorEditor extends CodeEditorBase {
    constructor(hostElement, lsKey) {
        super(lsKey);
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
        this.codeText = this.defaultText(true);
        // reindent on paste (adapted from https://github.com/ahuth/brackets-paste-and-indent/blob/master/main.js)
        this.cm.on("change", function (codeMirror, change) {
            if (change.origin !== "paste") {
                return;
            }
            var lineFrom = change.from.line;
            var lineTo = change.from.line + change.text.length;
            function reindentLines(codeMirror, lineFrom, lineTo) {
                codeMirror.operation(function () {
                    codeMirror.eachLine(lineFrom, lineTo, function (lineHandle) {
                        codeMirror.indentLine(lineHandle.lineNo(), "smart");
                    });
                });
            }
            reindentLines(codeMirror, lineFrom, lineTo);
        });
        const autoSaver = debounce(() => this.saveCode(), 1000);
        this.cm.on("change", autoSaver);
        // Secondary init for CodeEditorBase
        this.init();
    }
    get codeText() {
        return this.cm.getValue();
    }
    set codeText(text) {
        this.cm.setValue(text);
    }
    focus() {
        this.cm.focus();
    }
}
//# sourceMappingURL=codemirror.js.map