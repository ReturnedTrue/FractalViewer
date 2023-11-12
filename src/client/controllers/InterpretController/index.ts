import { Controller, OnStart } from "@flamework/core";
import { ExpressionEvaluator, ExpressionParser, ExpressionVariableMap } from "./ExpressionParser";

@Controller()
export class InterpretController implements OnStart {
	private interprettedExpressions = new Map<string, ExpressionEvaluator>();

	onStart() {}

	public interpret(expression: string) {
		const previousResult = this.interprettedExpressions.get(expression);
		if (previousResult) return previousResult;

		const parser = new ExpressionParser(expression);
		const evaluator = parser.parse();

		this.interprettedExpressions.set(expression, evaluator);

		return evaluator;
	}
}
