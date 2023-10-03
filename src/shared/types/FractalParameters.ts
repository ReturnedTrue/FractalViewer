import { FractalId } from "shared/enums/FractalId";
import { NewtonFunction } from "shared/enums/NewtonFunction";

export interface FractalParameters {
	fractalId: FractalId;

	pivot: [number, number];

	xOffset: number;
	yOffset: number;
	magnification: number;

	hueShift: number;

	juliaRealConstant: number;
	juliaImaginaryConstant: number;

	newtonFunction: NewtonFunction;
	newtonPreferRootBasisHue: boolean;
	newtonCoefficientReal: number;
	newtonCoefficientImaginary: number;
}

export type FractalParameterName = keyof FractalParameters;

export type FractalParameterNameForType<T> = {
	[key in FractalParameterName]: FractalParameters[key] extends T ? key : never;
}[FractalParameterName];

export type FractalParameterValueForType<T> = FractalParameters[FractalParameterNameForType<T>];
