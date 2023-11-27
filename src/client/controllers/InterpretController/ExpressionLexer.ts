import { DefinedFunction, DefinedOperator, definedOperatorData } from "./SyntaxDefinitions";
import { ExpressionToken, ExpressionTokenCategory } from "./ExpressionToken";
import { enumToArray } from "client/enums/enumToArray";

interface ExpressionTokenCapture {
	patterns: Array<string>;
	consumes: boolean;
	category: ExpressionTokenCategory | ((content: string) => ExpressionTokenCategory);
}

const definedOperatorNames = enumToArray(DefinedOperator);
const definedFunctionNames = enumToArray(DefinedFunction);

const tokenCaptures: Array<ExpressionTokenCapture> = [
	{ patterns: ["%s"], consumes: true, category: ExpressionTokenCategory.Whitespace },
	{ patterns: ["%d", "%."], consumes: true, category: ExpressionTokenCategory.Number },
	{
		patterns: definedOperatorNames.mapFiltered((operator) => {
			const operatorData = definedOperatorData.get(operator);
			if (!operatorData) return;

			return operatorData.matchingPattern;
		}),

		consumes: false,
		category: ExpressionTokenCategory.Operator,
	},
	{
		patterns: ["%w"],
		consumes: true,
		category: (content) => {
			if (definedFunctionNames.includes(content as DefinedFunction)) {
				return ExpressionTokenCategory.Function;
			}

			if (content === "i") {
				return ExpressionTokenCategory.ImaginaryConstant;
			}

			return ExpressionTokenCategory.Variable;
		},
	},
	{
		patterns: [","],
		consumes: false,
		category: ExpressionTokenCategory.Comma,
	},
	{
		patterns: ["%(", "%)"],
		consumes: false,
		category: ExpressionTokenCategory.Parenthesis,
	},
];

export class ExpressionLexer {
	private position = 1;

	constructor(private expression: string) {}

	public getAllTokens() {
		const tokens = new Array<ExpressionToken>();
		const expressionSize = this.expression.size();

		while (this.position <= expressionSize) {
			let isUnexpected = true;

			for (const capture of tokenCaptures) {
				if (this.matchesAtPosition(capture, this.position)) {
					const token = this.pullAllOfCapture(capture);

					if (token.category !== ExpressionTokenCategory.Whitespace) {
						tokens.push(token);
					}

					isUnexpected = false;
					break;
				}
			}

			if (isUnexpected) {
				throw `unexpected character: ${this.getCharacterAt(this.position)}`;
			}
		}

		return tokens;
	}

	private getCharacterAt(position: number) {
		return this.expression.sub(position, position);
	}

	private matchesAtPosition(capture: ExpressionTokenCapture, position: number) {
		for (const pattern of capture.patterns) {
			const result = string.match(this.getCharacterAt(position), pattern)[0];

			if (result !== undefined) {
				return true;
			}
		}

		return false;
	}

	private pullAllOfCapture(capture: ExpressionTokenCapture): ExpressionToken {
		let fullContent = this.getCharacterAt(this.position);

		while (
			capture.consumes &&
			this.position + 1 < this.expression.size() &&
			this.matchesAtPosition(capture, this.position + 1)
		) {
			fullContent += this.getCharacterAt(this.position + 1);
			this.position++;
		}

		this.position++;

		return {
			content: fullContent,
			category: typeIs(capture.category, "function") ? capture.category(fullContent) : capture.category,
		};
	}
}
