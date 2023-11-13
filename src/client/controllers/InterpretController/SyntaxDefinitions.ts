import { complexPow, modulus } from "../CalculationController/ComplexMath";
import { ExpressionNodeValue } from "./ExpressionNode";

export enum DefinedFunction {
	Mod = "mod",
	Floor = "floor",
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
			execute: (arg) => {
				if (arg.isComplex) return { data: modulus(...arg.data), isComplex: false };

				return { data: math.abs(arg.data), isComplex: false };
			},

			argumentsExpected: 1,
		},
	],
	/*[
		DefinedFunction.Floor,
		{
			execute: (arg) => {
				if (arg.isComplex) throw "unexpected complex number to floor";

				return term(math.floor(arg.value));
			},

			argumentsExpected: 1,
		},
	],

	[
		DefinedFunction.Real,
		{
			execute: (arg) => {
				if (!arg.isComplex) throw "unexpected real number to Re";

				return term(arg.value[0]);
			},

			argumentsExpected: 1,
		},
	],

	[
		DefinedFunction.Imaginary,
		{
			execute: (arg) => {
				if (!arg.isComplex) throw "unexpected real number to Im";

				return term(arg.value[1]);
			},

			argumentsExpected: 1,
		},
	],*/
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

export const definedOperatorData = new Map<DefinedOperator, DefinedOperatorData>([
	[
		DefinedOperator.Plus,

		{
			matchingPattern: "%+",

			execute: (leftHand, rightHand) => {
				if (leftHand.isComplex) {
					if (rightHand.isComplex) {
						return {
							data: [leftHand.data[0] + rightHand.data[0], leftHand.data[1] + rightHand.data[1]],
							isComplex: true,
						};
					}

					return { data: [leftHand.data[0] + rightHand.data, leftHand.data[1]], isComplex: true };
				}

				if (rightHand.isComplex) {
					return { data: [leftHand.data + rightHand.data[0], rightHand.data[1]], isComplex: true };
				}

				return { data: leftHand.data + rightHand.data, isComplex: false };
			},
		},
	],

	[
		DefinedOperator.Power,

		{
			matchingPattern: "%^",

			execute: (leftHand, rightHand) => {
				if (leftHand.isComplex) {
					if (rightHand.isComplex) {
						throw "complex to complex power is not supported";
					}

					return { data: complexPow(leftHand.data[0], leftHand.data[1], rightHand.data), isComplex: true };
				}

				if (rightHand.isComplex) {
					throw "soon to support real to complex powers";
				}

				return { data: leftHand.data ** rightHand.data, isComplex: false };
			},
		},
	],
	/*[
		DefinedOperator.Subtract,
		(leftHand, rightHand) => {
			return leftHand;
		},
	],*/
]);
