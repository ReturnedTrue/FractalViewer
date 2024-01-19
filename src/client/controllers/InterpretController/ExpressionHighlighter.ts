import { ExpressionToken, ExpressionTokenCategory } from "./ExpressionToken";
import {
	DefinedOperatorDataEncirculingExecute,
	DefinedOperatorDataExecute,
	definedFunctionData,
	definedOperatorData,
} from "./SyntaxDefinitions";

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

const getFontString = (color: string, content: string) => `<font color="rgb(${color})">${content}</font>`;

export class ExpressionHighlighter {
	constructor(private allTokens: ExpressionToken[]) {}

	public run(availableVariables: string[]) {
		let richString = "";

		for (const token of this.allTokens) {
			const color = this.getColorForToken(token, availableVariables);

			richString += getFontString(color, token.content);
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

export const createStringConnector = (separator: string) => {
	let str = "";
	let isTrailing = false;

	const connect = (connected: string) => {
		if (isTrailing) {
			str += separator;
		} else {
			isTrailing = true;
		}

		str += connected;
	};

	const get = () => str;

	return $tuple(get, connect);
};

export const getFunctionList = () => {
	let list = "";

	// TODO cleanup
	const functionColor = categoryColors.get(ExpressionTokenCategory.Function) ?? defaultColor;
	const parenthesisColor = categoryColors.get(ExpressionTokenCategory.Parenthesis) ?? defaultColor;
	const operatorColor = categoryColors.get(ExpressionTokenCategory.Operator) ?? defaultColor;
	const commaColor = categoryColors.get(ExpressionTokenCategory.Comma) ?? defaultColor;

	for (const [func, funcData] of definedFunctionData) {
		const [getArgumentList, connectToArgumentList] = createStringConnector(getFontString(commaColor, ", "));

		for (const arg of funcData.argumentsDetails) {
			connectToArgumentList(`${arg.name}${getFontString(operatorColor, ":")} ${arg.kind}`);
		}

		list += `${getFontString(functionColor, func)}${getFontString(parenthesisColor, "(")}`;
		list += `${getArgumentList()}${getFontString(parenthesisColor, ")")}\n`;
	}

	return list;
};

export const getOperatorList = () => {
	let list = "";

	const operatorColor = categoryColors.get(ExpressionTokenCategory.Operator) ?? defaultColor;

	for (const [operator, operatorData] of definedOperatorData) {
		const coloredOperator = getFontString(operatorColor, operator);

		const [getModeList, connectToModeList] = createStringConnector(" | ");

		if (operatorData.execute) {
			connectToModeList(`a ${coloredOperator} b`);
		}

		if (operatorData.unaryExecute) {
			connectToModeList(`${coloredOperator}a`);
		}

		if (operatorData.postfixExecute) {
			connectToModeList(`a${coloredOperator}`);
		}

		list += `[${coloredOperator}]: ${getModeList()}\n`;
	}

	return list;
};
