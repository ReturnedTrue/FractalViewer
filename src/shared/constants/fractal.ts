import { FractalId } from "shared/enums/FractalId";
import { NewtonFunction } from "shared/enums/NewtonFunction";
import { FractalParameterName, FractalParameters } from "shared/types/FractalParameters";

export const AXIS_SIZE = 500;
export const AXIS_ITERATION_SIZE = 500 - 1;

export const MAX_SECONDS_BEFORE_WAIT = 5;
export const MAX_ITERATIONS = 100;
export const MAX_STABLE = 2;

export const WASD_MOVEMENT_INCREMENT = 50;
export const MAGNIFICATION_INCREMENT = 1;

export const CAMERA_FOV = 70;

export const NEWTON_TOLERANCE = 0.000001;

export const DEFAULT_FRACTAL_PARAMETERS = {
	fractalId: FractalId.Mandelbrot,

	pivot: [0, 0],

	xOffset: 0,
	yOffset: 0,
	magnification: 1,

	hueShift: 0,

	juliaRealConstant: 0.01,
	juliaImaginaryConstant: 0.01,

	newtonFunction: NewtonFunction.Quadratic,
	newtonPreferRootBasisHue: false,
	newtonCoefficientReal: 1,
	newtonCoefficientImaginary: 0,
} satisfies FractalParameters;

export const PARAMETERS_WHICH_RETAIN_CACHE = new Set<FractalParameterName>(["xOffset", "yOffset", "pivot"]);
