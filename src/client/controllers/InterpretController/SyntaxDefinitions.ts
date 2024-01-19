import {
	complexCos,
	complexDiv,
	complexMul,
	complexPow,
	complexSine,
	complexTan,
	modulus,
	realToComplexPow,
} from "../../math/complex";
import { ExpressionNodeValue } from "./ExpressionNode";

const hasImaginaryPart = (z: ExpressionNodeValue) => z[1] !== 0;

const createReal = (x: number) => [x, 0] satisfies ExpressionNodeValue;

const boxComplexTuple = <T extends unknown[]>(
	func: (...args: T) => LuaTuple<ExpressionNodeValue>,
	...passedArguments: T
) => {
	const [real, imaginary] = func(...passedArguments);

	return [real, imaginary] satisfies ExpressionNodeValue;
};

export enum DefinedFunction {
	Mod = "mod",
	Floor = "floor",
	Ceil = "ceil",
	Fibonacci = "fib",
	Weierstrass = "weier",
	RiemannZeta = "zeta",
	NaturalLog = "ln",
	Exp = "exp",
	Sine = "sin",
	Cosine = "cos",
	Tan = "tan",
	Real = "Re",
	Imaginary = "Im",
	Conjugate = "Conjugate",
}

export interface DefinedFunctionArgumentData {
	kind: "real" | "complex";
	name: string;
}

export interface DefinedFunctionData {
	argumentsDetails: Array<DefinedFunctionArgumentData>;

	execute: (...args: Array<ExpressionNodeValue>) => ExpressionNodeValue;
}

export const definedFunctionData = new Map<DefinedFunction, DefinedFunctionData>([
	[
		DefinedFunction.Mod,
		{
			argumentsDetails: [
				{
					kind: "complex",
					name: "z",
				},
			],

			execute: (z) => createReal(modulus(...z)),
		},
	],

	[
		DefinedFunction.Floor,
		{
			argumentsDetails: [
				{
					kind: "complex",
					name: "z",
				},
			],

			execute: (z) => [math.floor(z[0]), math.floor(z[1])],
		},
	],

	[
		DefinedFunction.Ceil,
		{
			argumentsDetails: [
				{
					kind: "complex",
					name: "z",
				},
			],

			execute: (z) => [math.ceil(z[0]), math.ceil(z[1])],
		},
	],

	[
		DefinedFunction.Fibonacci,
		{
			argumentsDetails: [
				{
					kind: "real",
					name: "x",
				},
			],

			execute: (x) => {
				if (hasImaginaryPart(x)) throw "unexpected complex number to fib";

				if (x[0] <= 1) return x;

				let a = 0;
				let b = 1;

				for (const _ of $range(2, x[0] + 1)) {
					[a, b] = [b, a + b];
				}

				return createReal(b);
			},
		},
	],

	[
		DefinedFunction.Weierstrass,
		{
			argumentsDetails: [
				{
					kind: "real",
					name: "a",
				},

				{
					kind: "real",
					name: "b",
				},

				{
					kind: "real",
					name: "x",
				},
			],

			execute: (a, b, x) => {
				if (hasImaginaryPart(a) || hasImaginaryPart(b) || hasImaginaryPart(x))
					throw "unexpected complex number to weier function";

				if (!(a[0] > 0 && a[0] < 1)) throw "weier expects 0 < a < 1";
				if (!(math.modf(b[0])[1] === 0 && b[0] % 2 !== 0)) throw "weier expects b to be an odd integer";
				if (a[0] * b[0] < 1 + 1.5 * math.pi) throw "weier expects ab > 1 + 3/2 pi";

				let result = 0;

				// n = 10
				for (const r of $range(0, 10)) {
					result += a[0] ** r * math.cos(b[0] ** r * math.pi * x[0]);
				}

				return createReal(result);
			},
		},
	],

	[
		DefinedFunction.RiemannZeta,
		{
			argumentsDetails: [
				{
					kind: "complex",
					name: "s",
				},
			],

			execute: (s) => {
				const n = 10;

				if (!hasImaginaryPart(s)) {
					//if (s < 1) throw "zeta expects s > 1";

					let result = 0;

					for (const r of $range(1, n)) {
						result += 1 / r ** s[0];
					}

					return [result, 0];
				}

				//if (s[0] < 1) throw "zeta expects Re(s) > 1";

				let result: ExpressionNodeValue = [0, 0];

				for (const r of $range(1, n)) {
					let [real, imaginary] = realToComplexPow(r, s[0], s[1]);
					[real, imaginary] = complexDiv(1, 0, real, imaginary);

					result = [result[0] + real, result[1] + imaginary];
				}

				return result;
			},
		},
	],

	[
		DefinedFunction.NaturalLog,
		{
			argumentsDetails: [
				{
					kind: "real",
					name: "x",
				},
			],

			execute: (x) => {
				if (hasImaginaryPart(x)) throw "unexpected complex number to ln";

				return createReal(math.log(x[0]));
			},
		},
	],

	[
		DefinedFunction.Exp,
		{
			argumentsDetails: [
				{
					kind: "real",
					name: "x",
				},
			],

			execute: (x) => {
				if (hasImaginaryPart(x)) throw "unexpected complex number to exp";

				return createReal(math.exp(x[0]));
			},
		},
	],

	[
		DefinedFunction.Sine,
		{
			argumentsDetails: [
				{
					kind: "complex",
					name: "x",
				},
			],

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					return boxComplexTuple(complexSine, x[0], x[1]);
				}

				return createReal(math.sin(x[0]));
			},
		},
	],

	[
		DefinedFunction.Cosine,
		{
			argumentsDetails: [
				{
					kind: "complex",
					name: "x",
				},
			],

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					return boxComplexTuple(complexCos, x[0], x[1]);
				}

				return createReal(math.cos(x[0]));
			},
		},
	],

	[
		DefinedFunction.Tan,
		{
			argumentsDetails: [
				{
					kind: "real",
					name: "x",
				},
			],

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					return boxComplexTuple(complexTan, x[0], x[1]);
				}

				return createReal(math.tan(x[0]));
			},
		},
	],

	[
		DefinedFunction.Real,
		{
			argumentsDetails: [
				{
					kind: "complex",
					name: "z",
				},
			],

			execute: (z) => {
				return createReal(z[0]);
			},
		},
	],

	[
		DefinedFunction.Imaginary,
		{
			argumentsDetails: [
				{
					kind: "complex",
					name: "z",
				},
			],

			execute: (arg) => {
				return createReal(arg[1]);
			},
		},
	],

	[
		DefinedFunction.Conjugate,
		{
			argumentsDetails: [
				{
					kind: "complex",
					name: "z",
				},
			],

			execute: (z) => {
				return [z[0], -z[1]];
			},
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
	execute?: DefinedOperatorDataExecute;

	unaryExecute?: DefinedOperatorDataEncirculingExecute;
	postfixExecute?: DefinedOperatorDataEncirculingExecute;
};

export type DefinedOperatorDataExecute = (
	leftHand: ExpressionNodeValue,
	rightHand: ExpressionNodeValue,
) => ExpressionNodeValue;

export type DefinedOperatorDataEncirculingExecute = (arg: ExpressionNodeValue) => ExpressionNodeValue;

type NodeValueHandlerResult = number | [number, number] | string;

type NodeValueHandlers = {
	bothReal: (leftHand: number, rightHand: number) => NodeValueHandlerResult;
	bothComplex: (leftHand: [number, number], rightHand: [number, number]) => NodeValueHandlerResult;

	leftComplex: (leftHand: [number, number], rightHand: number) => NodeValueHandlerResult;
	rightComplex: (leftHand: number, rightHand: [number, number]) => NodeValueHandlerResult;
};

export const definedOperatorData = new Map<DefinedOperator, DefinedOperatorData>([
	[
		DefinedOperator.Plus,

		{
			matchingPattern: "%+",

			execute: (leftHand, rightHand) => [leftHand[0] + rightHand[0], leftHand[1] + rightHand[1]],
		},
	],

	[
		DefinedOperator.Subtract,

		{
			matchingPattern: "%-",

			execute: (leftHand, rightHand) => [leftHand[0] - rightHand[0], leftHand[1] - rightHand[1]],

			unaryExecute: (z) => [-z[0], -z[1]],
		},
	],

	[
		DefinedOperator.Multiply,
		{
			matchingPattern: "*",

			execute: (leftHand, rightHand) =>
				boxComplexTuple(complexMul, leftHand[0], leftHand[1], rightHand[0], rightHand[1]),
		},
	],

	[
		DefinedOperator.Divide,
		{
			matchingPattern: "/",

			execute: (leftHand, rightHand) =>
				boxComplexTuple(complexDiv, leftHand[0], leftHand[1], rightHand[0], rightHand[1]),
		},
	],

	[
		DefinedOperator.Power,

		{
			matchingPattern: "%^",

			execute: (leftHand, rightHand) => {
				if (hasImaginaryPart(leftHand)) {
					if (hasImaginaryPart(rightHand)) {
						throw "complex to complex power is not supported";
					}

					return boxComplexTuple(complexPow, leftHand[0], leftHand[1], rightHand[0]);
				}

				if (hasImaginaryPart(rightHand)) {
					return boxComplexTuple(realToComplexPow, leftHand[0], rightHand[0], rightHand[1]);
				}

				return createReal(leftHand[0] ** rightHand[0]);
			},
		},
	],

	[
		DefinedOperator.Factorial,
		{
			matchingPattern: "!",

			postfixExecute: (x) => {
				if (hasImaginaryPart(x)) throw "cannot use factorial on complex numbers";

				const real = x[0];

				const [_, fractional] = math.modf(real);
				if (fractional !== 0) throw "cannot use factorial on non-integers";

				if (real < 0) throw "cannot use factorial on negative integers";
				if (real < 3) return createReal(real);

				let result = 2;

				for (const i of $range(2, real)) {
					result *= i;
				}

				return createReal(real);
			},
		},
	],
]);
