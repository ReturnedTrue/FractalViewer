import { complexCos, complexPow, complexSine, complexTan, modulus } from "../CalculationController/ComplexMath";
import { ExpressionNodeValue, nodeValue } from "./ExpressionNode";

export enum DefinedFunction {
	Mod = "mod",
	Floor = "floor",
	Fibonacci = "fib",
	NaturalLog = "ln",
	Exp = "exp",
	Sine = "sin",
	Cosine = "cos",
	Tan = "tan",
	Real = "Re",
	Imaginary = "Im",
}

export interface DefinedFunctionData {
	execute: (...args: Array<ExpressionNodeValue>) => ExpressionNodeValue;
	argumentsExpected: number;
}

export const definedFunctionData = new Map<DefinedFunction, DefinedFunctionData>([
	[
		DefinedFunction.Mod,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (arg.isComplex) return nodeValue(modulus(...arg.data));

				return nodeValue(math.abs(arg.data));
			},
		},
	],

	[
		DefinedFunction.Floor,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (arg.isComplex) throw "unexpected complex number to floor";

				return nodeValue(math.floor(arg.data));
			},
		},
	],

	[
		DefinedFunction.Fibonacci,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (arg.isComplex) throw "unexpected complex number to fib";

				const n = arg.data;
				if (n <= 1) return nodeValue(n);

				let a = 0;
				let b = 1;

				for (const _ of $range(2, n + 1)) {
					[a, b] = [b, a + b];
				}

				return nodeValue(b);
			},
		},
	],

	[
		DefinedFunction.NaturalLog,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (arg.isComplex) throw "unexpected complex number to ln";

				return nodeValue(math.log(arg.data));
			},
		},
	],

	[
		DefinedFunction.Exp,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (arg.isComplex) throw "unexpected complex number to exp";

				return nodeValue(math.exp(arg.data));
			},
		},
	],

	[
		DefinedFunction.Sine,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (arg.isComplex) {
					const [real, imaginary] = complexSine(arg.data[0], arg.data[1]);

					return nodeValue([real, imaginary]);
				}

				return nodeValue(math.sin(arg.data));
			},
		},
	],

	[
		DefinedFunction.Cosine,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (arg.isComplex) {
					const [real, imaginary] = complexCos(arg.data[0], arg.data[1]);

					return nodeValue([real, imaginary]);
				}

				return nodeValue(math.cos(arg.data));
			},
		},
	],

	[
		DefinedFunction.Tan,
		{
			execute: (arg) => {
				if (arg.isComplex) {
					const [real, imaginary] = complexTan(arg.data[0], arg.data[1]);

					return nodeValue([real, imaginary]);
				}

				return nodeValue(math.tan(arg.data));
			},

			argumentsExpected: 1,
		},
	],

	[
		DefinedFunction.Real,
		{
			execute: (arg) => {
				if (!arg.isComplex) throw "unexpected real number to Re";

				return nodeValue(arg.data[0]);
			},

			argumentsExpected: 1,
		},
	],

	[
		DefinedFunction.Imaginary,
		{
			execute: (arg) => {
				if (!arg.isComplex) throw "unexpected real number to Im";

				return nodeValue(arg.data[1]);
			},

			argumentsExpected: 1,
		},
	],
]);

export enum DefinedOperator {
	Plus = "+",
	Subtract = "-",
	Power = "^",
}

export type DefinedOperatorData = {
	matchingPattern: string;
	execute: (leftHand: ExpressionNodeValue, rightHand: ExpressionNodeValue) => ExpressionNodeValue;
};

type NodeValueHandlerResult = number | [number, number] | string;

type NodeValueHandlers = {
	bothReal: (leftHand: number, rightHand: number) => NodeValueHandlerResult;
	bothComplex: (leftHand: [number, number], rightHand: [number, number]) => NodeValueHandlerResult;

	leftComplex: (leftHand: [number, number], rightHand: number) => NodeValueHandlerResult;
	rightComplex: (leftHand: number, rightHand: [number, number]) => NodeValueHandlerResult;
};

function withNodeValuesHandled(handlers: NodeValueHandlers) {
	return (leftHand: ExpressionNodeValue, rightHand: ExpressionNodeValue) => {
		let result: NodeValueHandlerResult;

		if (leftHand.isComplex) {
			if (rightHand.isComplex) {
				result = handlers.bothComplex(leftHand.data, rightHand.data);
			} else {
				result = handlers.leftComplex(leftHand.data, rightHand.data);
			}
		} else {
			if (rightHand.isComplex) {
				result = handlers.rightComplex(leftHand.data, rightHand.data);
			} else {
				result = handlers.bothReal(leftHand.data, rightHand.data);
			}
		}

		if (typeIs(result, "string")) {
			throw result;
		}

		return nodeValue(result);
	};
}

export const definedOperatorData = new Map<DefinedOperator, DefinedOperatorData>([
	[
		DefinedOperator.Plus,

		{
			matchingPattern: "%+",

			execute: withNodeValuesHandled({
				bothReal: (leftHand, rightHand) => leftHand + rightHand,
				bothComplex: (leftHand, rightHand) => [leftHand[0] + rightHand[0], leftHand[1] + rightHand[1]],
				leftComplex: (leftHand, rightHand) => [leftHand[0] + rightHand, leftHand[1]],
				rightComplex: (leftHand, rightHand) => [leftHand + rightHand[0], rightHand[1]],
			}),
		},
	],

	[
		DefinedOperator.Subtract,

		{
			matchingPattern: "%-",

			execute: withNodeValuesHandled({
				bothReal: (leftHand, rightHand) => leftHand - rightHand,
				bothComplex: (leftHand, rightHand) => [leftHand[0] - rightHand[0], leftHand[1] - rightHand[1]],
				leftComplex: (leftHand, rightHand) => [leftHand[0] - rightHand, leftHand[1]],
				rightComplex: (leftHand, rightHand) => [leftHand - rightHand[0], rightHand[1]],
			}),
		},
	],

	[
		DefinedOperator.Power,

		{
			matchingPattern: "%^",

			execute: withNodeValuesHandled({
				bothReal: (leftHand, rightHand) => leftHand ** rightHand,
				bothComplex: (_leftHand, _rightHand) => "complex to complex power is not supported",
				leftComplex: (leftHand, rightHand) => {
					const [real, imaginary] = complexPow(leftHand[0], leftHand[1], rightHand);

					return [real, imaginary];
				},
				rightComplex: (leftHand, rightHand) => "real to complex power is not supported",
			}),
		},
	],
]);
