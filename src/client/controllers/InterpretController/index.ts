import { Controller, OnStart } from "@flamework/core";
import { ExpressionParser } from "./ExpressionParser";

@Controller()
export class InterpretController implements OnStart {
	//private interprettedExpressions = new Map<string, ExpressionResult>();

	onStart() {
		this.interpret("floor(Im((2 + 2) + i) + 0.5)");
	}

	public interpret(expression: string) {
		//const previousResult = this.interprettedExpressions.get(expression);
		//if (previousResult) return previousResult;

		print("interpretting:", expression);

		const parser = new ExpressionParser(expression);
		print(parser.parse());
	}
}
