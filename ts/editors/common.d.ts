
import { Observable } from '../observable.js'

export interface CodeEditor extends Observable {
	codeText: string;
	
	reset(): void;
	saveCode(): void;
	focus(): void;

	trigger(event: "change"): this;
	trigger(event: "apply_code"): this;
	trigger(event: "code_success"): this;
	trigger(event: "usercode_error", error: any): this;

	on(event: "change", cb: () => void): this;
	on(event: "apply_code", cb: () => void): this;
	on(event: "code_success", cb: () => void): this;
	on(event: "usercode_error", cb: (error: any) => void): this;
}
