import { DefinedFunction, DefinedOperator } from "./SyntaxDefinitions";
import { ExpressionToken, ExpressionTokenCategory } from "./ExpressionToken";
import { stringEnumToArray } from "shared/enums/enumToArray";

interface ExpressionTokenCapture {
	patterns: Array<string>;
	consumes: boolean;
	category: ExpressionTokenCategory | ((content: string) => ExpressionTokenCategory);
}

const reservedCharacters = ["+", "-"];

const definedOperatorNames = stringEnumToArray(DefinedOperator);
const definedFunctionNames = stringEnumToArray(DefinedFunction);

const tokenCaptures: Array<ExpressionTokenCapture> = [
	{ patterns: ["%s"], consumes: true, category: ExpressionTokenCategory.Whitespace },
	{ patterns: ["%d", "%."], consumes: true, category: ExpressionTokenCategory.Number },
	{
		patterns: definedOperatorNames.map((value) => {
			for (const reserved of reservedCharacters) {
				value = string.gsub(value, reserved, "%%" + reserved)[0];
			}

			return value;
		}),
		consumes: false,
		category: ExpressionTokenCategory.Operator,
	},
	{
		patterns: ["%w"],
		consumes: true,
		category: (content) => {
			if (definedFunctionNames.includes(content)) {
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

	public getNextToken(): ExpressionToken | false {
		if (this.position > this.expression.size()) return false;

		for (const capture of tokenCaptures) {
			if (this.matchesAtPosition(capture, this.position)) {
				const token = this.pullAllOfCapture(capture);

				if (token.category !== ExpressionTokenCategory.Whitespace) {
					return token;
				}

				if (this.position > this.expression.size()) return false;
			}
		}

		throw "unexpected character";
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
