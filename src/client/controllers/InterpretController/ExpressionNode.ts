import { DefinedFunctionData, DefinedOperatorData, DefinedOperatorDataEncirculingExecute } from "./SyntaxDefinitions";

export type ExpressionNodeValue = [number, number];

export enum ExpressionNodeCategory {
	Constant = "constant",
	Variable = "variable",
	Operation = "operation",
	EncirclingOperation = "unary/postfix operation",
	Function = "function",
}

type BaseExpressionNode<T extends ExpressionNodeCategory> = {
	category: T;
};

export interface ConstantExpressionNode extends BaseExpressionNode<ExpressionNodeCategory.Constant> {
	constantValue: ExpressionNodeValue;
}

export interface VariableExpressionNode extends BaseExpressionNode<ExpressionNodeCategory.Variable> {
	variableName: string;
}

export interface OperationExpressionNode extends BaseExpressionNode<ExpressionNodeCategory.Operation> {
	operatorExecute: Exclude<DefinedOperatorData["execute"], undefined>;

	left: ExpressionNode;
	right: ExpressionNode;
}

// eslint-disable-next-line prettier/prettier
export interface EncirclingOperationExpressionNode extends BaseExpressionNode<ExpressionNodeCategory.EncirclingOperation> {
	encirclingExecute: DefinedOperatorDataEncirculingExecute;

	argument: ExpressionNode;
}

export interface FunctionExpressionNode extends BaseExpressionNode<ExpressionNodeCategory.Function> {
	functionExecute: DefinedFunctionData["execute"];

	arguments: Array<ExpressionNode>;
}

export type ExpressionNode =
	| ConstantExpressionNode
	| VariableExpressionNode
	| OperationExpressionNode
	| EncirclingOperationExpressionNode
	| FunctionExpressionNode;
