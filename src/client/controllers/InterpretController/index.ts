import { Controller, OnStart } from "@flamework/core";
import { ExpressionEvaluator, ExpressionParser, ExpressionVariableMap } from "./ExpressionParser";

/**
 * z^fib(mod(z)) + c = peanut
 * z^fib(mod(z) - n) + c = brain scan (works where initial z = c)
 * z^fib(mod(z) - ln(n)) + c = eye of cthulhu (more defined where initial z = c)
 * z^fib(exp(mod(z)) - ln(n)) + c = reverse eye
 * z^(fib(tan(|z|))) + c = bomb
 * z^(fib(tan(n))) + c = butterfly
 */

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
