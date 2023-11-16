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
					return node.constantValue;

				case ExpressionNodeCategory.Variable:
					const value = variables.get(node.variableName);
					if (value === undefined) throw `could not get variable: ${node.variableName}`;

					return value;

				case ExpressionNodeCategory.Operation:
					const lhs = evaluate(node.left, variables);
					const rhs = evaluate(node.right, variables);

					return node.operatorData.execute(lhs, rhs);

				case ExpressionNodeCategory.Function:
					const argumentsEvaluated = new Array<ExpressionNodeValue>();

					for (const argument of node.arguments) {
						argumentsEvaluated.push(evaluate(argument, variables));
					}

					return node.functionData.execute(...argumentsEvaluated);
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

			const operator = currentToken.content;
			const operatorData = definedOperatorData.get(operator as DefinedOperator);
			if (!operatorData) throw `no data set for operator: ${operator}`;

			this.consumeCurrentToken();

			const rightHand = this.parseTerm();

			leftHand = {
				category: ExpressionNodeCategory.Operation,
				operatorData,
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
				const castedContent = tonumber(content);
				if (castedContent === undefined) throw "malformed number received";

				this.consumeCurrentToken();

				return {
					category: ExpressionNodeCategory.Constant,
					constantValue: castedContent,
				};

			case ExpressionTokenCategory.ImaginaryConstant:
				this.consumeCurrentToken();
				return { category: ExpressionNodeCategory.Constant, constantValue: [0, 1] };

			case ExpressionTokenCategory.Parenthesis:
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: "(" });

				const result = this.parseExpression();
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: ")" });

				return result;

			case ExpressionTokenCategory.Variable:
				this.consumeCurrentToken();

				return { category: ExpressionNodeCategory.Variable, variableName: content };

			case ExpressionTokenCategory.Function:
				const functionData = definedFunctionData.get(content as DefinedFunction);

				if (!functionData) {
					throw `no data set for function: ${content}`;
				}

				this.consumeCurrentToken();
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: "(" });

				const argumentsCollected = new Array<ExpressionNode>();

				for (const i of $range(1, functionData.argumentsExpected)) {
					if (i !== 1) {
						this.consumeCurrentToken({ category: ExpressionTokenCategory.Comma, content: "," });
					}

					argumentsCollected.push(this.parseExpression());
				}

				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: ")" });

				return {
					category: ExpressionNodeCategory.Function,
					functionData,
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
