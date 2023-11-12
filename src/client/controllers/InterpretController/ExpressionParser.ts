import { ExpressionLexer } from "./ExpressionLexer";
import {
	ExpressionNode,
	ConstantExpressionNode,
	ExpressionNodeCategory,
	ExpressionNodeValue,
	OperationExpressionNode,
} from "./ExpressionNode";
import { ExpressionToken, ExpressionTokenCategory } from "./ExpressionToken";
import { DefinedFunction, DefinedOperator, definedFunctionData, definedOperatorData } from "./SyntaxDefinitions";

export type ExpressionVariableMap = Map<string, ExpressionNodeValue>;
export type ExpressionEvaluator = (variables: ExpressionVariableMap) => ExpressionNodeValue;

export class ExpressionParser {
	private allTokens: ExpressionToken[];
	private currentTokenNumber = 0;

	constructor(expression: string) {
		const lexer = new ExpressionLexer(expression);
		this.allTokens = lexer.getAllTokens();

		print(this.allTokens);
	}

	public parse(): ExpressionEvaluator {
		const parsed = this.parseExpression();

		print("nodes:", parsed);

		const evaluate = (node: ExpressionNode, variables: ExpressionVariableMap): ExpressionNodeValue => {
			switch (node.category) {
				case ExpressionNodeCategory.Constant:
					return node.value;

				case ExpressionNodeCategory.Variable:
					const value = variables.get(node.variable);

					if (value === undefined) throw `could not get variable ${node.variable}`;

					return value;

				// TODO: get operator data and function data in the parsing stage
				case ExpressionNodeCategory.Operation:
					const operatorData = definedOperatorData.get(node.operator);

					if (!operatorData) throw `could not get data for operator ${node.operator}`;

					const lhs = evaluate(node.left, variables);
					const rhs = evaluate(node.right, variables);

					return operatorData(lhs, rhs);

				case ExpressionNodeCategory.Function:
					throw "not handled";
			}
		};

		return (variables) => evaluate(parsed, variables);
	}

	private parseExpression(): ExpressionNode {
		let leftHand = this.parseTerm();

		while (true) {
			const currentToken = this.getCurrentToken();

			if (currentToken === undefined || currentToken.category !== ExpressionTokenCategory.Operator) {
				// Left hand becomes the middle of the tree
				return leftHand;
			}

			const operation = currentToken.content;
			this.consumeCurrentToken();

			const rightHand = this.parseTerm();

			leftHand = {
				category: ExpressionNodeCategory.Operation,
				operator: operation as DefinedOperator,
				left: leftHand,
				right: rightHand,
			} satisfies OperationExpressionNode;
		}
	}

	private parseTerm(): ExpressionNode {
		const currentToken = this.getCurrentToken();
		if (!currentToken) throw "next token expected";

		const { content, category } = currentToken;

		switch (category) {
			case ExpressionTokenCategory.Number:
				const value = tonumber(content);
				if (value === undefined) throw "malformed number received";

				this.consumeCurrentToken();
				return { category: ExpressionNodeCategory.Constant, value: { data: value, isComplex: false } };

			case ExpressionTokenCategory.ImaginaryConstant:
				this.consumeCurrentToken();
				return { category: ExpressionNodeCategory.Constant, value: { data: [0, 1], isComplex: true } };

			case ExpressionTokenCategory.Parenthesis:
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: "(" });

				const result = this.parseExpression();
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: ")" });

				return result;

			case ExpressionTokenCategory.Variable:
				this.consumeCurrentToken();

				return { category: ExpressionNodeCategory.Variable, variable: content };

			case ExpressionTokenCategory.Function:
				const functionData = definedFunctionData.get(content as DefinedFunction);

				if (!functionData) {
					throw `no data set for function: ${content}`;
				}

				this.consumeCurrentToken();
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: "(" });

				const argumentsCollected = [];

				for (const i of $range(1, functionData.argumentsExpected)) {
					if (i !== 1) {
						this.consumeCurrentToken({ category: ExpressionTokenCategory.Comma, content: "," });
					}

					argumentsCollected.push(this.parseExpression());
				}

				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: ")" });

				return {
					category: ExpressionNodeCategory.Function,
					func: content as DefinedFunction,
					arguments: argumentsCollected,
				};

			default:
				throw `unexpected token category: ${category}`;
		}
	}

	private consumeCurrentToken(expected?: ExpressionToken) {
		const currentToken = this.getCurrentToken();
		if (!currentToken) throw "cannot consume next token when it does not exist";

		if (expected) {
			if (currentToken.category !== expected.category) {
				throw `expected to consume category: ${expected.category} got: ${currentToken.category}`;
			}

			if (currentToken.content !== expected.content) {
				throw `expected to consume content: ${expected.content} got: ${currentToken.content}`;
			}
		}

		this.currentTokenNumber++;
	}

	private getCurrentToken(): ExpressionToken | undefined {
		return this.allTokens[this.currentTokenNumber];
	}
}
