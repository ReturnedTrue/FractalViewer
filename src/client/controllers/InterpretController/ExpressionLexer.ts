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

	{
		patterns: ["%d", "%."],
		consumes: true,
		category: ExpressionTokenCategory.Number,
	},

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

	{
		patterns: ["|"],
		consumes: false,
		category: ExpressionTokenCategory.Pipe,
	},
];

export class ExpressionLexer {
	private position = 0;

	private characters: Array<string>;
	private numberOfCharacters: number;

	constructor(expression: string) {
		this.characters = expression.split("");
		this.numberOfCharacters = this.characters.size();
	}

	public getAllTokens() {
		const tokens = new Array<ExpressionToken>();

		while (this.position < this.numberOfCharacters) {
			let isUnexpected = true;
			let currentCharacter = "";

			for (const capture of tokenCaptures) {
				currentCharacter = this.characters[this.position];
				if (!this.captureMatchesWithCharacter(capture, currentCharacter)) continue;

				const token = this.pullAllOfCapture(capture, currentCharacter);
				tokens.push(token);

				isUnexpected = false;
				break;
			}

			if (isUnexpected) {
				throw `unexpected character: ${currentCharacter}`;
			}
		}

		return tokens;
	}

	private captureMatchesWithCharacter(capture: ExpressionTokenCapture, character: string) {
		for (const pattern of capture.patterns) {
			const result = string.match(character, pattern)[0];

			if (result !== undefined) {
				return true;
			}
		}

		return false;
	}

	private pullAllOfCapture(capture: ExpressionTokenCapture, firstCharacter: string): ExpressionToken {
		let fullContent = firstCharacter;

		while (capture.consumes && this.position + 1 < this.numberOfCharacters) {
			const nextCharacter = this.characters[this.position + 1];
			if (!this.captureMatchesWithCharacter(capture, nextCharacter)) break;

			fullContent += nextCharacter;
			this.position++;
		}

		this.position++;

		return {
			content: fullContent,
			category: typeIs(capture.category, "function") ? capture.category(fullContent) : capture.category,
		};
	}
}
