import {
	complexCos,
	complexDiv,
	complexExp,
	complexLn,
	complexMul,
	complexPow,
	complexSine,
	complexTan,
	modulus,
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
	Gamma = "gamma",
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

export type DefinedFunctionExecute = (...args: Array<ExpressionNodeValue>) => ExpressionNodeValue;

export interface DefinedFunctionData {
	argumentData: Array<DefinedFunctionArgumentData>;

	execute: DefinedFunctionExecute;
}

const sqrtTwoPi = math.sqrt(2 * math.pi);
const lanczosApproxCoefficients = [
	0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
	12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
];

const gammaG = 7;

/*
	let t = z + g + 0.5

	gamma(z + 1) = root(2 * pi) * ( t ^ (z + 0.5) ) * ( e ^ -t )
*/
const gamma: DefinedFunctionExecute = (z) => {
	if (z[0] < 0.5) {
		const [sineReal, sineImaginary] = complexSine(math.pi * z[0], math.pi * z[1]);
		const recurseResult = gamma([1 - z[0], z[1]]);

		const [denominatorReal, denominatorImaginary] = complexMul(
			sineReal,
			sineImaginary,
			recurseResult[0],
			recurseResult[1],
		);

		return boxComplexTuple(complexDiv, math.pi, 0, denominatorReal, denominatorImaginary);
	}

	const originalReal = z[0] - 1;
	const originalImaginary = z[1];

	let sumReal = lanczosApproxCoefficients[0];
	let sumImaginary = 0;

	for (let i = 0; i < lanczosApproxCoefficients.size(); i++) {
		const [dividedReal, divdedImaginary] = complexDiv(
			lanczosApproxCoefficients[i],
			0,
			originalReal + i,
			originalImaginary,
		);

		sumReal += dividedReal;
		sumImaginary += divdedImaginary;
	}

	const tReal = originalReal + gammaG + 0.5;
	const tImaginary = originalImaginary;

	const [powReal, powImaginary] = complexPow(tReal, tImaginary, originalReal + 0.5, originalImaginary);

	const [multipliedReal, multipledImaginary] = complexMul(
		sqrtTwoPi * sumReal,
		sqrtTwoPi * sumImaginary,
		powReal,
		powImaginary,
	);

	const [expReal, expImaginary] = complexExp(-tReal, -tImaginary);

	return boxComplexTuple(complexMul, multipliedReal, multipledImaginary, expReal, expImaginary);
};

export const definedFunctionData = new Map<DefinedFunction, DefinedFunctionData>([
	[
		DefinedFunction.Mod,
		{
			argumentData: [
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
			argumentData: [
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
			argumentData: [
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
			argumentData: [
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
			argumentData: [
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

			execute: (rawA, rawB, rawX) => {
				if (hasImaginaryPart(rawA) || hasImaginaryPart(rawB) || hasImaginaryPart(rawX))
					throw "unexpected complex number to weier function";

				const a = rawA[0];
				const b = rawB[0];
				const x = rawX[0];

				if (!(a > 0 && a < 1)) throw "weier expects 0 < a < 1";
				if (!(math.modf(b)[1] === 0 && b % 2 !== 0)) throw "weier expects b to be an odd integer";
				if (a * b < 1 + 1.5 * math.pi) throw "weier expects ab > 1 + 3/2 pi";

				let result = 0;

				// n = 10
				for (const r of $range(0, 10)) {
					result += a ** r * math.cos(b ** r * math.pi * x);
				}

				return createReal(result);
			},
		},
	],

	[
		DefinedFunction.RiemannZeta,
		{
			argumentData: [
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

				let resultReal = 0;
				let resultImaginary = 0;

				for (const r of $range(1, n)) {
					let [real, imaginary] = complexPow(r, 0, s[0], s[1]);
					[real, imaginary] = complexDiv(1, 0, real, imaginary);

					resultReal += real;
					resultImaginary += imaginary;
				}

				return [resultReal, resultImaginary];
			},
		},
	],

	[
		DefinedFunction.Gamma,
		{
			argumentData: [
				{
					kind: "complex",
					name: "z",
				},
			],

			execute: gamma,
		},
	],

	[
		DefinedFunction.NaturalLog,
		{
			argumentData: [
				{
					kind: "complex",
					name: "x",
				},
			],

			execute: (x) => {
				if (hasImaginaryPart(x)) return boxComplexTuple(complexLn, x[0], x[1]);

				return createReal(math.log(x[0]));
			},
		},
	],

	[
		DefinedFunction.Exp,
		{
			argumentData: [
				{
					kind: "complex",
					name: "x",
				},
			],

			execute: (x) => {
				if (hasImaginaryPart(x)) return boxComplexTuple(complexExp, x[0], x[1]);

				return createReal(math.exp(x[0]));
			},
		},
	],

	[
		DefinedFunction.Sine,
		{
			argumentData: [
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
			argumentData: [
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
			argumentData: [
				{
					kind: "complex",
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
			argumentData: [
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
			argumentData: [
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
			argumentData: [
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

			execute: (leftHand, rightHand) => {
				return boxComplexTuple(complexMul, leftHand[0], leftHand[1], rightHand[0], rightHand[1]);
			},
		},
	],

	[
		DefinedOperator.Divide,
		{
			matchingPattern: "/",

			execute: (leftHand, rightHand) => {
				return boxComplexTuple(complexDiv, leftHand[0], leftHand[1], rightHand[0], rightHand[1]);
			},
		},
	],

	[
		DefinedOperator.Power,

		{
			matchingPattern: "%^",

			execute: (leftHand, rightHand) => {
				return boxComplexTuple(complexPow, leftHand[0], leftHand[1], rightHand[0], rightHand[1]);
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
