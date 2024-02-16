import { Controller, OnStart } from "@flamework/core";
import { ExpressionParser } from "./ExpressionParser";
import { ExpressionLexer } from "./ExpressionLexer";
import { ExpressionEvaluator } from "./ExpressionEvaluator";
import { ExpressionHighlighter, getFunctionList, getOperatorList } from "./ExpressionHighlighter";

/*
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
 * tanh(z)^2 + c = bell
 * cot(z)^2 + c = mandelbrot veins + ridge (where intiial = c)
 *
 * Re(z^2) + (mod(Im(z^2)) * -1 * i) + c = burning ship
 * Conjugate(z)^2 + c = mandelbar
 */

/*
 * expression => lexer => tokens
 * tokens => parser => nodes
 *
 * nodes, variables => evaluator => result
 * tokens => highlighter => richtext
 */

@Controller()
export class InterpretController implements OnStart {
	private cachedEvaluators = new Map<string, ExpressionEvaluator>();
	private cachedHighlighters = new Map<string, ExpressionHighlighter>();

	onStart() {}

	public getEvaluator(expression: string) {
		const previousResult = this.cachedEvaluators.get(expression);
		if (previousResult) return previousResult;

		const lexer = new ExpressionLexer(expression);
		const tokens = lexer.getAllTokens();

		const parser = new ExpressionParser(tokens);
		const nodes = parser.getAllNodes();

		const evaluator = new ExpressionEvaluator(nodes);
		this.cachedEvaluators.set(expression, evaluator);

		return evaluator;
	}

	public getHighlighter(expression: string) {
		const previousResult = this.cachedHighlighters.get(expression);
		if (previousResult) return previousResult;

		const lexer = new ExpressionLexer(expression);
		const tokens = lexer.getAllTokens();

		const highlighter = new ExpressionHighlighter(tokens);
		this.cachedHighlighters.set(expression, highlighter);

		return highlighter;
	}

	public getCustomLists() {
		return {
			functions: getFunctionList(),
			operators: getOperatorList(),
		};
	}
}
