import { modulus } from "../CalculationController/ComplexMath";
import { ExpressionTerm, term } from "./ExpressionTerm";

export enum DefinedFunction {
	Mod = "mod",
	Floor = "floor",
	Real = "Re",
	Imaginary = "Im",
}

export interface DefinedFunctionData {
	execute: (...args: Array<ExpressionTerm>) => ExpressionTerm;
	argumentsExpected: number;
}

export const definedFunctionData = new Map<DefinedFunction, DefinedFunctionData>([
	[
		DefinedFunction.Mod,
		{
			execute: (arg) => {
				if (arg.isComplex) return term(modulus(...arg.value));

				return term(math.abs(arg.value));
			},

			argumentsExpected: 1,
		},
	],
	[
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
	],
]);

export enum DefinedOperator {
	Plus = "+",
	Subtract = "-",
}

export type DefinedOperatorData = (leftHand: ExpressionTerm, rightHand: ExpressionTerm) => ExpressionTerm;

export const definedOperatorData = new Map<DefinedOperator, DefinedOperatorData>([
	[
		DefinedOperator.Plus,
		// TODO clean up
		(leftHand, rightHand) => {
			if (leftHand.isComplex) {
				if (rightHand.isComplex) {
					return {
						value: [leftHand.value[0] + rightHand.value[0], leftHand.value[1] + rightHand.value[1]],
						isComplex: true,
					};
				}

				return { value: [leftHand.value[0] + rightHand.value, leftHand.value[1]], isComplex: true };
			}

			if (rightHand.isComplex) {
				return { value: [leftHand.value + rightHand.value[0], rightHand.value[1]], isComplex: true };
			}

			return { value: leftHand.value + rightHand.value, isComplex: false };
		},
	],
	/*[
		DefinedOperator.Subtract,
		(leftHand, rightHand) => {
			return leftHand;
		},
	],*/
]);
