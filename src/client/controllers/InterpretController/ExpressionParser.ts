import { ExpressionLexer } from "./ExpressionLexer";
import { ExpressionToken } from "./ExpressionToken";

export type ExpressionResult = (
	zReal: number,
	zImaginary: number,
	cReal: number,
	cImaginary: number,
	iteration: number,
) => void;

export class ExpressionParser {
	private lexer: ExpressionLexer;
	private nextToken: ExpressionToken | false;

	constructor(expression: string) {
		this.lexer = new ExpressionLexer(expression);
		this.nextToken = this.lexer.getNextToken();
	}

	public parse() {
		if (!this.nextToken) {
			throw "no next token";
		}

		const result = this.parseExpression();

		if (this.nextToken) {
			throw "unexpected token";
		}

		return result;
	}

	public parseExpression() {}
}
