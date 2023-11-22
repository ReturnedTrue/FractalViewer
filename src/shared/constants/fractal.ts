import { FractalId } from "shared/enums/FractalId";
import { NewtonFunction } from "shared/enums/NewtonFunction";
import { FractalParameterName, FractalParameters } from "shared/types/FractalParameters";

export const MAX_TIME_PER_CALCULATION_PART = 5;
export const MAX_TIME_PER_CALCULATION_ENTIRETY = 10;

export const MAX_PARTS_PER_CREATION_SEGMENT = 20000;
export const MAX_PARTS_PER_DELETION_SEGMENT = 25000;

export const WASD_MOVEMENT_INCREMENT = 50;
export const MAGNIFICATION_INCREMENT = 1;
export const HELD_INPUT_SECONDS_INTERVAL = 1;

export const CAMERA_FOV = 70;

export const NEWTON_TOLERANCE = 0.000001;

export const DEFAULT_FRACTAL_PARAMETERS = {
	fractalId: FractalId.Custom,
	maxIterations: 100,
	maxStable: 4,
	axisSize: 100,

	pivot: false,

	xOffset: 0,
	yOffset: 0,
	magnification: 1,

	hueShift: 0,

	burningShipFacesLeft: true,

	juliaRealConstant: 0.01,
	juliaImaginaryConstant: 0.01,

	newtonFunction: NewtonFunction.Quadratic,
	newtonPreferRootBasisHue: false,
	newtonCoefficientReal: 1,
	newtonCoefficientImaginary: 0,

	customInitialValueExpression: "0",
	customCalculationExpression: "z^2 + c",
} satisfies FractalParameters;

export const PARAMETERS_WHICH_RETAIN_CACHE = new Set<FractalParameterName>(["xOffset", "yOffset", "pivot", "hueShift"]);
