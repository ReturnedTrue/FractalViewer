import { ExpressionNode, ExpressionNodeCategory, ExpressionNodeValue } from "./ExpressionNode";

export type ExpressionVariableMap = Map<string, ExpressionNodeValue>;

export class ExpressionEvaluator {
	constructor(private baseNode: ExpressionNode) {}

	public run(variables: ExpressionVariableMap) {
		return this.evaluate(this.baseNode, variables);
	}

	private evaluate(node: ExpressionNode, variables: ExpressionVariableMap): ExpressionNodeValue {
		switch (node.category) {
			case ExpressionNodeCategory.Constant:
				return node.constantValue;

			case ExpressionNodeCategory.Variable:
				const value = variables.get(node.variableName);
				if (value === undefined) throw `could not get variable: ${node.variableName}`;

				return value;

			case ExpressionNodeCategory.Operation:
				const lhs = this.evaluate(node.left, variables);
				const rhs = this.evaluate(node.right, variables);

				return node.operatorExecute(lhs, rhs);

			case ExpressionNodeCategory.EncirclingOperation:
				const argument = this.evaluate(node.argument, variables);

				return node.encirclingExecute(argument);

			case ExpressionNodeCategory.Function:
				const argumentsEvaluated = new Array<ExpressionNodeValue>();

				for (const argument of node.arguments) {
					argumentsEvaluated.push(this.evaluate(argument, variables));
				}

				return node.functionExecute(...argumentsEvaluated);
		}
	}
}
