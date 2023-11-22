import { Controller, OnStart } from "@flamework/core";
import { ExpressionParser } from "./ExpressionParser";
import { ExpressionLexer } from "./ExpressionLexer";
import { ExpressionEvaluator } from "./ExpressionEvaluator";

/**
 * z^fib(mod(z)) + c = peanut
 * z^fib(mod(z) - n) + c = brain scan (works where initial z = c)
 * z^fib(mod(z) - ln(n)) + c = eye of cthulhu (more defined where initial z = c)
 * z^fib(exp(mod(z)) - ln(n)) + c = reverse eye
 * z^(fib(tan(|z|))) + c = bomb
 * z^(fib(tan(n))) + c = butterfly
 * z^2 + ln(mod(c)) = crosshair
 */

@Controller()
export class InterpretController implements OnStart {
	private interprettedExpressions = new Map<string, ExpressionEvaluator>();

	onStart() {}

	public interpret(expression: string) {
		const previousResult = this.interprettedExpressions.get(expression);
		if (previousResult) return previousResult;

		const lexer = new ExpressionLexer(expression);
		const parser = new ExpressionParser(lexer.getAllTokens());
		const evaluator = new ExpressionEvaluator(parser.getAllNodes());

		this.interprettedExpressions.set(expression, evaluator);

		return evaluator;
	}
}
