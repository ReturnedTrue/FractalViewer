import { ExpressionLexer } from "./ExpressionLexer";
import { ExpressionTerm } from "./ExpressionTerm";
import { ExpressionToken, ExpressionTokenCategory } from "./ExpressionToken";
import { DefinedFunction, DefinedOperator, definedFunctionData, definedOperatorData } from "./SyntaxDefinitions";

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
			throw `unexpected token with content: ${this.nextToken.content}`;
		}

		return result;
	}

	private parseExpression(): ExpressionTerm {
		let leftHand = this.parseTerm();

		while (this.nextToken && this.nextToken.category === ExpressionTokenCategory.Operator) {
			const operatorData = definedOperatorData.get(this.nextToken.content as DefinedOperator);

			if (!operatorData) {
				throw `no data set for operator: ${this.nextToken.content}`;
			}

			this.consumeNextToken();

			const rightHand = this.parseTerm();
			leftHand = operatorData(leftHand, rightHand);
		}

		return leftHand;
	}

	private parseTerm(): ExpressionTerm {
		if (!this.nextToken) throw "next token expected";

		const { content, category } = this.nextToken;

		switch (category) {
			case ExpressionTokenCategory.Number:
				const value = tonumber(content);
				if (value === undefined) throw "malformed number received";

				this.consumeNextToken();

				return { value, isComplex: false };

			case ExpressionTokenCategory.ImaginaryConstant:
				this.consumeNextToken();
				return { value: [0, 1], isComplex: true };

			case ExpressionTokenCategory.Parenthesis:
				this.consumeNextToken({ category: ExpressionTokenCategory.Parenthesis, content: "(" });

				const result = this.parseExpression();
				this.consumeNextToken({ category: ExpressionTokenCategory.Parenthesis, content: ")" });

				return result;

			case ExpressionTokenCategory.Variable:
				this.consumeNextToken();

				// TODO implement variable evaluation
				throw "unexpected variable";

				return { value: 1, isComplex: false };

			case ExpressionTokenCategory.Function:
				const functionData = definedFunctionData.get(content as DefinedFunction);

				if (!functionData) {
					throw `no data set for function: ${content}`;
				}

				this.consumeNextToken();
				this.consumeNextToken({ category: ExpressionTokenCategory.Parenthesis, content: "(" });

				const argumentsCollected = [];

				for (const i of $range(1, functionData.argumentsExpected)) {
					if (i !== 1) {
						this.consumeNextToken({ category: ExpressionTokenCategory.Comma, content: "," });
					}

					argumentsCollected.push(this.parseExpression());
				}

				this.consumeNextToken({ category: ExpressionTokenCategory.Parenthesis, content: ")" });

				return functionData.execute(...argumentsCollected);

			default:
				throw `unexpected token category: ${category}`;
		}
	}

	public consumeNextToken(expected?: ExpressionToken) {
		if (!this.nextToken) throw "cannot consume next token when it does not exist";

		if (expected) {
			if (this.nextToken.category !== expected.category) {
				throw `expected to consume category: ${expected.category} got: ${this.nextToken.category}`;
			}

			if (this.nextToken.content !== expected.content) {
				throw `expected to consume content: ${expected.content} got: ${this.nextToken.content}`;
			}
		}

		this.nextToken = this.lexer.getNextToken();
	}
}
