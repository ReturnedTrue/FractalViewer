import { ExpressionToken, ExpressionTokenCategory } from "./ExpressionToken";

const defaultColor = "204, 204, 204"; // white
const unrecognisedVariableColor = "255, 0, 0"; // red

const purple = "156, 147, 236";

const categoryColors = new Map<ExpressionTokenCategory, string>([
	[ExpressionTokenCategory.Number, "255, 204, 0"], // yellow
	[ExpressionTokenCategory.Function, "253, 251, 172"], // pale yellow
	[ExpressionTokenCategory.ImaginaryConstant, "248, 109, 124"], // pink

	[ExpressionTokenCategory.Operator, purple],
	[ExpressionTokenCategory.Comma, purple],
	[ExpressionTokenCategory.Parenthesis, purple],
	[ExpressionTokenCategory.Pipe, purple],
]);

export class ExpressionHighlighter {
	constructor(private allTokens: ExpressionToken[]) {}

	public run(availableVariables: string[]) {
		let richString = "";

		for (const token of this.allTokens) {
			const color = this.getColorForToken(token, availableVariables);

			richString += `<font color="rgb(${color})">${token.content}</font>`;
		}

		return richString;
	}

	private getColorForToken(token: ExpressionToken, availableVariables: string[]) {
		if (token.category === ExpressionTokenCategory.Variable && !availableVariables.includes(token.content)) {
			return unrecognisedVariableColor;
		}

		return categoryColors.get(token.category) ?? defaultColor;
	}
}
