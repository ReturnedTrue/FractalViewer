import { getAvailableFunctionNames } from "./AvailableFunctions";
import { ExpressionToken, ExpressionTokenCategory } from "./ExpressionToken";

type GetTokenResponse = { token: ExpressionToken; nextPosition: number };

interface ExpressionTokenCapture {
	patterns: Array<string>;
	consumes: boolean;
	category: ExpressionTokenCategory;
}

export class ExpressionLexer {
	private position = 1;
	private tokenCaptures: Array<ExpressionTokenCapture> = [
		{ patterns: ["%s"], consumes: true, category: ExpressionTokenCategory.Whitespace },
		{ patterns: ["%d", "%."], consumes: true, category: ExpressionTokenCategory.Number },
		{ patterns: ["%+", "%-"], consumes: false, category: ExpressionTokenCategory.Operator },
	];

	constructor(private expression: string) {}

	public getNextToken(): ExpressionToken | false {
		if (this.position > this.expression.size()) return false;

		for (const capture of this.tokenCaptures) {
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

		return { content: fullContent, category: capture.category };
	}
}
