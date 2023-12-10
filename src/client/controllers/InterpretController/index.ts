import { Controller, OnStart } from "@flamework/core";
import { ExpressionParser } from "./ExpressionParser";
import { ExpressionLexer } from "./ExpressionLexer";
import { ExpressionEvaluator } from "./ExpressionEvaluator";
import { $print } from "rbxts-transform-debug";

/**
 * z^fib(mod(z)) + c = peanut
 * z^fib(mod(z) - n) + c = brain scan (works where initial z = c)
 * z^fib(mod(z) - ln(n)) + c = eye of cthulhu (more defined where initial z = c)
 * z^fib(exp(mod(z)) - ln(n)) + c = reverse eye
 * z^(fib(tan(mod(z)))) + c = bomb
 * z^(fib(tan(n))) + c = butterfly (needs max stable 4 and initial = c)
 * z^2 + ln(mod(c)) = crosshair
 * z^weir(0.5, 101, fib(mod(z))) + c = shuriken
 * z^(floor(mod(z + 2))!) + c = shattered glass
 * z^(mod(tan(c))) + c = alien
 * z^4 + z^3 + z^2 + z + c = mandelbrot ridge
 *
 * Re(z^2) + (mod(Im(z^2)) * -1 * i) + c = burning ship
 * Conjugate(z)^2 + c = mandelbar
 */

@Controller()
export class InterpretController implements OnStart {
	private interprettedExpressions = new Map<string, ExpressionEvaluator>();

	onStart() {}

	public interpret(expression: string) {
		const previousResult = this.interprettedExpressions.get(expression);
		if (previousResult) return previousResult;

		$print("interpretting expression:", expression);

		const lexer = new ExpressionLexer(expression);
		const tokens = lexer.getAllTokens();

		$print("tokens:", tokens);

		const parser = new ExpressionParser(tokens);
		const nodes = parser.getAllNodes();

		$print("nodes:", nodes);

		const evaluator = new ExpressionEvaluator(nodes);

		this.interprettedExpressions.set(expression, evaluator);

		return evaluator;
	}
}
