import {
	complexCos,
	complexCosh,
	complexDiv,
	complexExp,
	complexLn,
	complexMul,
	complexPow,
	complexSine,
	complexSinh,
	complexTan,
	complexTanh,
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

const singleComplexArgumentData: DefinedFunctionData["argumentData"] = [
	{
		kind: "complex",
		name: "z",
	},
];

export enum DefinedFunction {
	// Complex
	Real = "Re",
	Imaginary = "Im",
	Conjugate = "Conjugate",

	// Calculus
	Mod = "mod",
	NaturalLog = "ln",
	Exp = "exp",

	// Rounding
	Floor = "floor",
	Ceil = "ceil",

	// Trig
	Sine = "sin",
	Cosecant = "cosec",
	Cosine = "cos",
	Secant = "sec",
	Tangent = "tan",
	Cotangent = "cot",

	// Hyp
	HyperbolicSine = "sinh",
	HyperbolicCosecant = "cosech",
	HyperbolicCosine = "cosh",
	HyperbolicSecant = "sech",
	HyperbolicTangent = "tanh",
	HyperbolicCotangent = "coth",

	// Misc
	Fibonacci = "fib",
	Weierstrass = "weier",
	RiemannZeta = "zeta",
	Gamma = "gamma",
}

export interface DefinedFunctionArgumentData {
	kind: "real" | "complex";
	name: string;
}

export type DefinedFunctionExecute = (...args: Array<ExpressionNodeValue>) => ExpressionNodeValue;

export interface DefinedFunctionData {
	order: number;
	argumentData: Array<DefinedFunctionArgumentData>;

	execute: DefinedFunctionExecute;
}

export const definedFunctionData = new Map<DefinedFunction, DefinedFunctionData>([
	[
		DefinedFunction.Real,
		{
			order: 0,
			argumentData: singleComplexArgumentData,

			execute: (z) => {
				return createReal(z[0]);
			},
		},
	],

	[
		DefinedFunction.Imaginary,
		{
			order: 1,
			argumentData: singleComplexArgumentData,

			execute: (arg) => {
				return createReal(arg[1]);
			},
		},
	],

	[
		DefinedFunction.Conjugate,
		{
			order: 2,
			argumentData: singleComplexArgumentData,

			execute: (z) => {
				return [z[0], -z[1]];
			},
		},
	],

	[
		DefinedFunction.Floor,
		{
			order: 100,
			argumentData: singleComplexArgumentData,

			execute: (z) => [math.floor(z[0]), math.floor(z[1])],
		},
	],

	[
		DefinedFunction.Ceil,
		{
			order: 101,
			argumentData: singleComplexArgumentData,

			execute: (z) => [math.ceil(z[0]), math.ceil(z[1])],
		},
	],

	[
		DefinedFunction.Mod,
		{
			order: 200,
			argumentData: singleComplexArgumentData,

			execute: (z) => createReal(modulus(...z)),
		},
	],

	[
		DefinedFunction.NaturalLog,
		{
			order: 201,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) return boxComplexTuple(complexLn, x[0], x[1]);

				return createReal(math.log(x[0]));
			},
		},
	],

	[
		DefinedFunction.Exp,
		{
			order: 202,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) return boxComplexTuple(complexExp, x[0], x[1]);

				return createReal(math.exp(x[0]));
			},
		},
	],

	[
		DefinedFunction.Sine,
		{
			order: 300,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					return boxComplexTuple(complexSine, x[0], x[1]);
				}

				return createReal(math.sin(x[0]));
			},
		},
	],

	[
		DefinedFunction.Cosecant,
		{
			order: 301,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					const [sineReal, sineImaginary] = complexSine(x[0], x[1]);

					return boxComplexTuple(complexDiv, 1, 0, sineReal, sineImaginary);
				}

				return createReal(1 / math.sin(x[0]));
			},
		},
	],

	[
		DefinedFunction.Cosine,
		{
			order: 302,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					return boxComplexTuple(complexCos, x[0], x[1]);
				}

				return createReal(math.cos(x[0]));
			},
		},
	],

	[
		DefinedFunction.Secant,
		{
			order: 303,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					const [cosineReal, cosineImaginary] = complexCos(x[0], x[1]);

					return boxComplexTuple(complexDiv, 1, 0, cosineReal, cosineImaginary);
				}

				return createReal(1 / math.cos(x[0]));
			},
		},
	],

	[
		DefinedFunction.Tangent,
		{
			order: 304,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					return boxComplexTuple(complexTan, x[0], x[1]);
				}

				return createReal(math.tan(x[0]));
			},
		},
	],

	[
		DefinedFunction.Cotangent,
		{
			order: 305,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					const [tanReal, tanImaginary] = complexTan(x[0], x[1]);

					return boxComplexTuple(complexDiv, 1, 0, tanReal, tanImaginary);
				}

				return createReal(1 / math.tan(x[0]));
			},
		},
	],

	[
		DefinedFunction.HyperbolicSine,
		{
			order: 400,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					return boxComplexTuple(complexSinh, x[0], x[1]);
				}

				return createReal(math.sinh(x[0]));
			},
		},
	],

	[
		DefinedFunction.HyperbolicCosecant,
		{
			order: 401,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					const [sinhReal, sinhImaginary] = complexSinh(x[0], x[1]);

					return boxComplexTuple(complexDiv, 1, 0, sinhReal, sinhImaginary);
				}

				return createReal(1 / math.sinh(x[0]));
			},
		},
	],

	[
		DefinedFunction.HyperbolicCosine,
		{
			order: 402,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					return boxComplexTuple(complexCosh, x[0], x[1]);
				}

				return createReal(math.cosh(x[0]));
			},
		},
	],

	[
		DefinedFunction.HyperbolicSecant,
		{
			order: 403,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					const [coshReal, coshImaginary] = complexCosh(x[0], x[1]);

					return boxComplexTuple(complexDiv, 1, 0, coshReal, coshImaginary);
				}

				return createReal(1 / math.cosh(x[0]));
			},
		},
	],

	[
		DefinedFunction.HyperbolicTangent,
		{
			order: 404,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					return boxComplexTuple(complexTanh, x[0], x[1]);
				}

				return createReal(math.tanh(x[0]));
			},
		},
	],

	[
		DefinedFunction.HyperbolicCotangent,
		{
			order: 405,
			argumentData: singleComplexArgumentData,

			execute: (x) => {
				if (hasImaginaryPart(x)) {
					const [tanhReal, tanhImaginary] = complexTanh(x[0], x[1]);

					return boxComplexTuple(complexDiv, 1, 0, tanhReal, tanhImaginary);
				}

				return createReal(1 / math.tanh(x[0]));
			},
		},
	],

	[
		DefinedFunction.Fibonacci,
		{
			order: 500,
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
			order: 501,
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

			execute: (() => {
				const weierstassN = 10;

				return (rawA, rawB, rawX) => {
					if (hasImaginaryPart(rawA) || hasImaginaryPart(rawB) || hasImaginaryPart(rawX))
						throw "unexpected complex number to weier function";

					const a = rawA[0];
					const b = rawB[0];
					const x = rawX[0];

					if (!(a > 0 && a < 1)) throw "weier expects 0 < a < 1";
					if (!(math.modf(b)[1] === 0 && b % 2 !== 0)) throw "weier expects b to be an odd integer";
					if (a * b < 1 + 1.5 * math.pi) throw "weier expects ab > 1 + 3/2 pi";

					let result = 0;

					for (const r of $range(0, weierstassN)) {
						result += a ** r * math.cos(b ** r * math.pi * x);
					}

					return createReal(result);
				};
			})(),
		},
	],

	[
		DefinedFunction.RiemannZeta,
		{
			order: 502,
			argumentData: [
				{
					kind: "complex",
					name: "s",
				},
			],

			execute: (() => {
				const zetaN = 10;

				return (s) => {
					if (!hasImaginaryPart(s)) {
						//if (s < 1) throw "zeta expects s > 1";

						let result = 0;

						for (const r of $range(1, zetaN)) {
							result += 1 / r ** s[0];
						}

						return [result, 0];
					}

					//if (s[0] < 1) throw "zeta expects Re(s) > 1";

					let resultReal = 0;
					let resultImaginary = 0;

					for (const r of $range(1, zetaN)) {
						const [powReal, powImaginary] = complexPow(r, 0, s[0], s[1]);
						const [divdedReal, divdedImaginary] = complexDiv(1, 0, powReal, powImaginary);

						resultReal += divdedReal;
						resultImaginary += divdedImaginary;
					}

					return [resultReal, resultImaginary];
				};
			})(),
		},
	],

	[
		DefinedFunction.Gamma,
		{
			order: 503,
			argumentData: singleComplexArgumentData,

			execute: (() => {
				const sqrtTwoPi = math.sqrt(2 * math.pi);
				const lanczosApproxCoefficients = [
					0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
					-176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
					1.5056327351493116e-7,
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

					const [powReal, powImaginary] = complexPow(
						tReal,
						tImaginary,
						originalReal + 0.5,
						originalImaginary,
					);

					const [multipliedReal, multipledImaginary] = complexMul(
						sqrtTwoPi * sumReal,
						sqrtTwoPi * sumImaginary,
						powReal,
						powImaginary,
					);

					const [expReal, expImaginary] = complexExp(-tReal, -tImaginary);

					return boxComplexTuple(complexMul, multipliedReal, multipledImaginary, expReal, expImaginary);
				};

				return gamma;
			})(),
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
	order: number;
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
			order: 1,
			matchingPattern: "%+",

			execute: (leftHand, rightHand) => [leftHand[0] + rightHand[0], leftHand[1] + rightHand[1]],
		},
	],

	[
		DefinedOperator.Subtract,

		{
			order: 2,
			matchingPattern: "%-",

			execute: (leftHand, rightHand) => [leftHand[0] - rightHand[0], leftHand[1] - rightHand[1]],

			unaryExecute: (z) => [-z[0], -z[1]],
		},
	],

	[
		DefinedOperator.Multiply,
		{
			order: 3,
			matchingPattern: "*",

			execute: (leftHand, rightHand) => {
				return boxComplexTuple(complexMul, leftHand[0], leftHand[1], rightHand[0], rightHand[1]);
			},
		},
	],

	[
		DefinedOperator.Divide,
		{
			order: 4,
			matchingPattern: "/",

			execute: (leftHand, rightHand) => {
				return boxComplexTuple(complexDiv, leftHand[0], leftHand[1], rightHand[0], rightHand[1]);
			},
		},
	],

	[
		DefinedOperator.Power,

		{
			order: 5,
			matchingPattern: "%^",

			execute: (leftHand, rightHand) => {
				return boxComplexTuple(complexPow, leftHand[0], leftHand[1], rightHand[0], rightHand[1]);
			},
		},
	],

	[
		DefinedOperator.Factorial,
		{
			order: 6,
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
