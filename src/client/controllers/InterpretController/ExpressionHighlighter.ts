import { ExpressionToken, ExpressionTokenCategory } from "./ExpressionToken";
import { DefinedFunction, DefinedFunctionData, definedFunctionData, definedOperatorData } from "./SyntaxDefinitions";

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

const getCategoryColor = (category: ExpressionTokenCategory) => categoryColors.get(category) ?? defaultColor;
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

		return getCategoryColor(token.category);
	}
}

const createStringConnector = (separator: string) => {
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

const sortMapByOrder = <K, V extends { order: number }>(mapData: Map<K, V>) => {
	const sortedData = new Array<[K, V]>();

	for (const [key, value] of mapData) {
		let i = sortedData.size() - 1;

		while (i >= 0) {
			const valueAtIndex = sortedData[i][1];
			sortedData[i + 1] = sortedData[i];

			if (valueAtIndex.order < value.order) {
				break;
			}

			i--;
		}

		sortedData[i + 1] = [key, value];
	}

	return sortedData;
};

export const getFunctionList = () => {
	let list = "";

	const functionColor = getCategoryColor(ExpressionTokenCategory.Function);
	const parenthesisColor = getCategoryColor(ExpressionTokenCategory.Parenthesis);
	const operatorColor = getCategoryColor(ExpressionTokenCategory.Operator);
	const commaColor = getCategoryColor(ExpressionTokenCategory.Comma);

	const comma = getFontString(commaColor, ", ");
	const colon = getFontString(operatorColor, ":");
	const openParenthesis = getFontString(parenthesisColor, "(");
	const closeParenthesis = getFontString(parenthesisColor, ")");

	list += "complex: real part, possibly an imaginary part\n";
	list += "real: only a real part\n\n";

	const sortedFunctionData = sortMapByOrder(definedFunctionData);

	for (const [funcName, funcData] of sortedFunctionData) {
		const func = getFontString(functionColor, funcName);
		const [getArgumentList, connectToArgumentList] = createStringConnector(comma);

		for (const argData of funcData.argumentData) {
			connectToArgumentList(`${argData.name}${colon} ${argData.kind}`);
		}

		list += `${func}${openParenthesis}${getArgumentList()}${closeParenthesis}\n`;
	}

	return list;
};

export const getOperatorList = () => {
	let list = "";

	const operatorColor = getCategoryColor(ExpressionTokenCategory.Operator);

	const sortedOperatorData = sortMapByOrder(definedOperatorData);

	for (const [operatorName, operatorData] of sortedOperatorData) {
		const operator = getFontString(operatorColor, operatorName);

		const [getModeList, connectToModeList] = createStringConnector(" | ");

		if (operatorData.execute) {
			connectToModeList(`a ${operator} b`);
		}

		if (operatorData.unaryExecute) {
			connectToModeList(`${operator}a`);
		}

		if (operatorData.postfixExecute) {
			connectToModeList(`a${operator}`);
		}

		list += `[${operator}]: ${getModeList()}\n`;
	}

	return list;
};
