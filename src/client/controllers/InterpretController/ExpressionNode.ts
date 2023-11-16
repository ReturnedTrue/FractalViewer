import { DefinedFunctionData, DefinedOperatorData } from "./SyntaxDefinitions";

type Real = { data: number; isComplex: false };
type Complex = { data: [number, number]; isComplex: true };

export type ExpressionNodeValue = Real | Complex;

export function nodeValue(data: number | [number, number]): ExpressionNodeValue {
	if (typeIs(data, "table")) {
		return { data, isComplex: true };
	}

	return { data, isComplex: false };
}

export enum ExpressionNodeCategory {
	Constant = "constant",
	Variable = "variable",
	Operation = "operation",
	Function = "function",
}

export interface ConstantExpressionNode {
	category: ExpressionNodeCategory.Constant;
	constantValue: ExpressionNodeValue;
}

export interface VariableExpressionNode {
	category: ExpressionNodeCategory.Variable;
	variableName: string;
}

export interface OperationExpressionNode {
	category: ExpressionNodeCategory.Operation;
	operatorData: DefinedOperatorData;

	left: ExpressionNode;
	right: ExpressionNode;
}

export interface FunctionExpressionNode {
	category: ExpressionNodeCategory.Function;
	functionData: DefinedFunctionData;

	arguments: Array<ExpressionNode>;
}

export type ExpressionNode =
	| ConstantExpressionNode
	| VariableExpressionNode
	| OperationExpressionNode
	| FunctionExpressionNode;
