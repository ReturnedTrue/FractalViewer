import { ExpressionNode, ExpressionNodeCategory } from "./ExpressionNode";
import { ExpressionToken, ExpressionTokenCategory } from "./ExpressionToken";
import { DefinedFunction, DefinedOperator, definedFunctionData, definedOperatorData } from "./SyntaxDefinitions";

const getGuaranteedOperatorData = (operator: string) => {
	const operatorData = definedOperatorData.get(operator as DefinedOperator);
	if (!operatorData) throw `no data set for operator: ${operator}`;

	return operatorData;
};

const getGuaranteedFunctionData = (func: string) => {
	const functionData = definedFunctionData.get(func as DefinedFunction);
	if (!functionData) throw `no data set for function: ${func}`;

	return functionData;
};

export class ExpressionParser {
	private allTokens: ExpressionToken[];
	private currentTokenNumber = 0;

	constructor(unfilteredTokens: ExpressionToken[]) {
		this.allTokens = unfilteredTokens.filter((token) => token.category !== ExpressionTokenCategory.Whitespace);
	}

	public getAllNodes() {
		return this.parseExpression();
	}

	private parseExpression(): ExpressionNode {
		const beginningToken = this.getCurrentToken();
		if (!beginningToken) throw `expected expression`;

		let leftHand = this.parseTerm();

		while (true) {
			const currentToken = this.getCurrentToken();

			if (currentToken === undefined || currentToken.category !== ExpressionTokenCategory.Operator) {
				// Left hand becomes the middle of the tree
				return leftHand;
			}

			const operatorData = getGuaranteedOperatorData(currentToken.content);
			if (!operatorData.execute) throw `cannot use operator ${currentToken.content} in a 2-argument fashion`;

			this.consumeCurrentToken();

			const rightHand = this.parseTerm();

			leftHand = {
				category: ExpressionNodeCategory.Operation,
				operatorExecute: operatorData.execute,
				left: leftHand,
				right: rightHand,
			} satisfies ExpressionNode;
		}
	}

	private parseTerm(): ExpressionNode {
		const currentToken = this.getCurrentToken();
		if (!currentToken) throw "next token expected";

		// Unary operators
		if (currentToken.category === ExpressionTokenCategory.Operator) {
			const operatorData = getGuaranteedOperatorData(currentToken.content);
			if (!operatorData.unaryExecute) throw `cannot use operator ${currentToken.content} in a unary fashion`;

			this.consumeCurrentToken();

			return {
				category: ExpressionNodeCategory.EncirclingOperation,
				encirclingExecute: operatorData.unaryExecute,

				argument: this.parseTerm(),
			} satisfies ExpressionNode;
		}

		const termNode = this.convertTermTokenToNode(currentToken);
		const nextToken = this.getCurrentToken();

		// Postfix operators
		if (nextToken && nextToken.category === ExpressionTokenCategory.Operator) {
			const operatorData = getGuaranteedOperatorData(nextToken.content);

			if (operatorData.postfixExecute) {
				this.consumeCurrentToken();

				return {
					category: ExpressionNodeCategory.EncirclingOperation,
					encirclingExecute: operatorData.postfixExecute,

					argument: termNode,
				} satisfies ExpressionNode;
			}
		}

		return termNode;
	}

	private convertTermTokenToNode({ category, content }: ExpressionToken): ExpressionNode {
		switch (category) {
			case ExpressionTokenCategory.Number:
				const castedContent = tonumber(content);
				if (castedContent === undefined) throw "malformed number received";

				this.consumeCurrentToken();

				return {
					category: ExpressionNodeCategory.Constant,
					constantValue: [castedContent, 0],
				};

			case ExpressionTokenCategory.ImaginaryConstant:
				this.consumeCurrentToken();
				return { category: ExpressionNodeCategory.Constant, constantValue: [0, 1] };

			case ExpressionTokenCategory.Variable:
				this.consumeCurrentToken();

				return { category: ExpressionNodeCategory.Variable, variableName: content };

			case ExpressionTokenCategory.Parenthesis:
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: "(" });

				const parenthesisResult = this.parseExpression();
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: ")" });

				return parenthesisResult;

			case ExpressionTokenCategory.Pipe:
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Pipe, content: "|" });

				const pipeResult = this.parseExpression();
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Pipe, content: "|" });

				const modulusFunctionData = definedFunctionData.get(DefinedFunction.Mod);
				if (!modulusFunctionData) throw "could not get modulus function data";

				return {
					category: ExpressionNodeCategory.Function,
					functionExecute: modulusFunctionData.execute,
					arguments: [pipeResult],
				};

			case ExpressionTokenCategory.Function:
				const functionData = getGuaranteedFunctionData(content);

				this.consumeCurrentToken();
				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: "(" });

				const argumentsCollected = new Array<ExpressionNode>();

				for (const i of $range(1, functionData.argumentsDetails.size())) {
					if (i !== 1) {
						this.consumeCurrentToken({ category: ExpressionTokenCategory.Comma, content: "," });
					}

					argumentsCollected.push(this.parseExpression());
				}

				this.consumeCurrentToken({ category: ExpressionTokenCategory.Parenthesis, content: ")" });

				return {
					category: ExpressionNodeCategory.Function,
					functionExecute: functionData.execute,
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
