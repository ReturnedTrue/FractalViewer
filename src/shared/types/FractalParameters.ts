import { BarnsleyFernName } from "shared/enums/BarnsleyFernName";
import { FractalId } from "shared/enums/FractalId";
import { NewtonFunction } from "shared/enums/NewtonFunction";
import { RenderingMethod } from "shared/enums/RenderingMethod";

export interface FractalParameters {
	fractalId: FractalId;
	maxIterations: number;
	maxStable: number;
	axisSize: number;

	pivot: [number, number] | false;

	offsetX: number;
	offsetY: number;
	magnification: number;

	renderingMethod: RenderingMethod;
	hueShift: number;

	juliaRealConstant: number;
	juliaImaginaryConstant: number;
	juliaCorrespondingSet: FractalId;

	newtonFunction: NewtonFunction;
	newtonPreferRootBasisHue: boolean;
	newtonCoefficientReal: number;
	newtonCoefficientImaginary: number;

	barnsleyFernName: BarnsleyFernName;

	customInitialValueExpression: string;
	customCalculationExpression: string;
}

export type FractalParameterName = keyof FractalParameters;

export type FractalParameterNameForType<T> = {
	[key in FractalParameterName]: FractalParameters[key] extends T ? key : never;
}[FractalParameterName];

export type FractalParameterValueForType<T> = FractalParameters[FractalParameterNameForType<T>];

export type PivotParameterData = FractalParameters["pivot"];
