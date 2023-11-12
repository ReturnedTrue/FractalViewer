import { DefinedFunction, DefinedOperator } from "./SyntaxDefinitions";

type Real = { data: number; isComplex: false };
type Complex = { data: [number, number]; isComplex: true };

export type ExpressionNodeValue = Real | Complex;

export enum ExpressionNodeCategory {
	Constant = "constant",
	Variable = "variable",
	Operation = "operation",
	Function = "function",
}

export interface ConstantExpressionNode {
	category: ExpressionNodeCategory.Constant;
	value: ExpressionNodeValue;
}

export interface VariableExpressionNode {
	category: ExpressionNodeCategory.Variable;
	variable: string;
}

export interface OperationExpressionNode {
	category: ExpressionNodeCategory.Operation;
	operator: DefinedOperator;

	left: ExpressionNode;
	right: ExpressionNode;
}

export interface FunctionExpressionNode {
	category: ExpressionNodeCategory.Function;
	func: DefinedFunction;

	arguments: Array<ExpressionNode>;
}

export type ExpressionNode =
	| ConstantExpressionNode
	| VariableExpressionNode
	| OperationExpressionNode
	| FunctionExpressionNode;
