import { DefinedFunctionData, DefinedOperatorData } from "./SyntaxDefinitions";

type Real = number;
type Complex = [number, number];

export type ExpressionNodeValue = Real | Complex;

export function isValueComplex(value: ExpressionNodeValue): value is Complex {
	return typeIs(value, "table");
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
