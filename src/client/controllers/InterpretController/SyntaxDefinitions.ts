import {
	complexCos,
	complexDiv,
	complexMul,
	complexPow,
	complexSine,
	complexTan,
	modulus,
} from "../CalculationController/ComplexMath";
import { ExpressionNodeValue, isValueComplex } from "./ExpressionNode";

export enum DefinedFunction {
	Mod = "mod",
	Floor = "floor",
	Fibonacci = "fib",
	NaturalLog = "ln",
	Exp = "exp",
	Sine = "sin",
	Cosine = "cos",
	Tan = "tan",
	Weierstrass = "weir",
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
				if (isValueComplex(arg)) return modulus(...arg);

				return math.abs(arg);
			},
		},
	],

	[
		DefinedFunction.Floor,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (isValueComplex(arg)) throw "unexpected complex number to floor";

				return math.floor(arg);
			},
		},
	],

	[
		DefinedFunction.Fibonacci,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (isValueComplex(arg)) throw "unexpected complex number to fib";

				if (arg <= 1) return arg;

				let a = 0;
				let b = 1;

				for (const _ of $range(2, arg + 1)) {
					[a, b] = [b, a + b];
				}

				return b;
			},
		},
	],

	[
		DefinedFunction.NaturalLog,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (isValueComplex(arg)) throw "unexpected complex number to ln";

				return math.log(arg);
			},
		},
	],

	[
		DefinedFunction.Exp,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (isValueComplex(arg)) throw "unexpected complex number to exp";

				return math.exp(arg);
			},
		},
	],

	[
		DefinedFunction.Sine,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (isValueComplex(arg)) {
					const [real, imaginary] = complexSine(arg[0], arg[1]);

					return [real, imaginary];
				}

				return math.sin(arg);
			},
		},
	],

	[
		DefinedFunction.Cosine,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (isValueComplex(arg)) {
					const [real, imaginary] = complexCos(arg[0], arg[1]);

					return [real, imaginary];
				}

				return math.cos(arg);
			},
		},
	],

	[
		DefinedFunction.Tan,
		{
			argumentsExpected: 1,

			execute: (arg) => {
				if (isValueComplex(arg)) {
					const [real, imaginary] = complexTan(arg[0], arg[1]);

					return [real, imaginary];
				}

				return math.tan(arg);
			},
		},
	],

	[
		DefinedFunction.Weierstrass,
		{
			argumentsExpected: 3,

			execute: (a, b, x) => {
				if (isValueComplex(a) || isValueComplex(b) || isValueComplex(x))
					throw "unexpected complex number to Weierstrass function";

				if (!(a > 0 && a < 1)) throw "weir expects 0 < a < 1";
				if (!(math.modf(b)[1] === 0 && b % 2 !== 0)) throw "weir expects b to be an odd integer";
				if (a * b < 1 + 1.5 * math.pi) throw "weir expects ab > 1 + 3/2 pi";

				let result = 0;

				// n = 10
				for (const r of $range(0, 10)) {
					result += a ** r * math.cos(b ** r * math.pi * x);
				}

				return result;
			},
		},
	],

	[
		DefinedFunction.Real,
		{
			execute: (arg) => {
				if (!isValueComplex(arg)) throw "unexpected real number to Re";

				return arg[0];
			},

			argumentsExpected: 1,
		},
	],

	[
		DefinedFunction.Imaginary,
		{
			execute: (arg) => {
				if (!isValueComplex(arg)) throw "unexpected real number to Im";

				return arg[1];
			},

			argumentsExpected: 1,
		},
	],
]);

export enum DefinedOperator {
	Plus = "+",
	Subtract = "-",
	Multiply = "*",
	Divide = "/",
	Power = "^",
	Factorial = "!",
}

export type DefinedOperatorData = {
	matchingPattern: string;
	execute?: (leftHand: ExpressionNodeValue, rightHand: ExpressionNodeValue) => ExpressionNodeValue;

	unaryExecute?: DefinedOperatorDataEncirculingExecute;
	postfixExecute?: DefinedOperatorDataEncirculingExecute;
};

export type DefinedOperatorDataEncirculingExecute = (arg: ExpressionNodeValue) => ExpressionNodeValue;

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

		if (isValueComplex(leftHand)) {
			if (isValueComplex(rightHand)) {
				result = handlers.bothComplex(leftHand, rightHand);
			} else {
				result = handlers.leftComplex(leftHand, rightHand);
			}
		} else {
			if (isValueComplex(rightHand)) {
				result = handlers.rightComplex(leftHand, rightHand);
			} else {
				result = handlers.bothReal(leftHand, rightHand);
			}
		}

		if (typeIs(result, "string")) {
			throw result;
		}

		return result;
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
				rightComplex: (leftHand, rightHand) => [leftHand - rightHand[0], -rightHand[1]],
			}),

			unaryExecute: (arg) => {
				if (isValueComplex(arg)) return [-arg[0], -arg[1]];

				return -arg;
			},
		},
	],

	[
		DefinedOperator.Multiply,
		{
			matchingPattern: "*",

			execute: withNodeValuesHandled({
				bothReal: (leftHand, rightHand) => leftHand * rightHand,
				bothComplex: (leftHand, rightHand) => {
					const [real, imaginary] = complexMul(leftHand[0], leftHand[1], rightHand[0], rightHand[1]);

					return [real, imaginary];
				},
				leftComplex: (leftHand, rightHand) => [leftHand[0] * rightHand, leftHand[1] * rightHand],
				rightComplex: (leftHand, rightHand) => [leftHand * rightHand[0], leftHand * rightHand[1]],
			}),
		},
	],

	[
		DefinedOperator.Divide,
		{
			matchingPattern: "/",

			execute: withNodeValuesHandled({
				bothReal: (leftHand, rightHand) => (rightHand === 0 ? 0 : leftHand / rightHand),
				bothComplex: (leftHand, rightHand) => {
					const [real, imaginary] = complexDiv(leftHand[0], leftHand[1], rightHand[0], rightHand[1]);

					return [real, imaginary];
				},
				leftComplex: (leftHand, rightHand) =>
					rightHand === 0 ? 0 : [leftHand[0] / rightHand, leftHand[1] / rightHand],

				rightComplex: (leftHand, rightHand) => [leftHand / rightHand[0], leftHand / rightHand[1]],
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
				rightComplex: (_leftHand, _rightHand) => "real to complex power is not supported",
			}),
		},
	],

	[
		DefinedOperator.Factorial,
		{
			matchingPattern: "!",

			postfixExecute: (arg) => {
				if (isValueComplex(arg)) throw "cannot use factorial on complex numbers";

				const [_, fractional] = math.modf(arg);
				if (fractional !== 0) throw "cannot use factorial on non-integers";

				if (arg < 0) throw "cannot use factorial on negative integers";
				if (arg < 3) return arg;

				let result = 2;

				for (const i of $range(2, arg)) {
					result *= i;
				}

				return result;
			},
		},
	],
]);
