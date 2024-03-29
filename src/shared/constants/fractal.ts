import { BarnsleyFernName } from "shared/enums/BarnsleyFernName";
import { FractalId } from "shared/enums/FractalId";
import { NewtonFunction } from "shared/enums/NewtonFunction";
import { RenderingMethod } from "shared/enums/RenderingMethod";
import { FractalParameterName, FractalParameters } from "shared/types/FractalParameters";

export const MAX_TIME_PER_CALCULATION_PART = 5;
export const MAX_TIME_PER_CALCULATION_ENTIRETY = 20;

export const MAX_PARTS_PER_CREATION_SEGMENT = 20000;
export const MAX_PARTS_PER_DELETION_SEGMENT = 25000;

export const WASD_MOVEMENT_INCREMENT = 50;
export const MAGNIFICATION_INCREMENT = 1;
export const HELD_INPUT_SECONDS_INTERVAL = 0.5;

export const CAMERA_FOV = 70;

export const NEWTON_TOLERANCE = 0.000001;

export const DEFAULT_FRACTAL_PARAMETERS = {
	fractalId: FractalId.Mandelbrot,
	maxIterations: 100,
	maxStable: 2,
	axisSize: 100,

	pivot: false,

	offsetX: 0,
	offsetY: 0,
	magnification: 1,

	renderingMethod: RenderingMethod.Iteration,
	hueShift: 0,

	juliaRealConstant: 0.01,
	juliaImaginaryConstant: 0.01,
	juliaCorrespondingSet: FractalId.Mandelbrot,

	newtonFunction: NewtonFunction.Quadratic,
	newtonPreferRootBasisHue: false,
	newtonCoefficientReal: 1,
	newtonCoefficientImaginary: 0,

	barnsleyFernName: BarnsleyFernName.Barnsley,

	customInitialValueExpression: "0",
	customCalculationExpression: "z^2 + c",
} satisfies FractalParameters;

export const PARAMETERS_WHICH_RETAIN_CACHE = new Set<FractalParameterName>(["offsetX", "offsetY", "pivot", "hueShift"]);

export const PARAMETERS_WHICH_ARE_RESET = new Set<FractalParameterName>([
	"offsetX",
	"offsetY",
	"magnification",
	"pivot",
	"hueShift",
]);
