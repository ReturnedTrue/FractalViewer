import { Controller, OnStart } from "@flamework/core";
import { ExpressionParser, ExpressionResult } from "./ExpressionParser";

@Controller()
export class InterpretController implements OnStart {
	private interprettedExpressions = new Map<string, ExpressionResult>();

	onStart() {
		this.interpret("200 + 2.02 - 4");
	}

	public interpret(expression: string) {
		const previousResult = this.interprettedExpressions.get(expression);
		if (previousResult) return previousResult;

		const parser = new ExpressionParser(expression);
		parser.parse();
	}
}
