import { modulus, complexDiv, complexMul } from "client/controllers/CalculationController/ComplexMath";
import { NEWTON_TOLERANCE } from "shared/constants/fractal";
import { FractalId } from "shared/enums/FractalId";
import { FractalParameters } from "shared/types/FractalParameters";
import { newtonFunctionData } from "./NewtonFunctionData";

type FractalCalculator = (x: number, y: number, parameters: Omit<FractalParameters, "offsetX" | "offsetY">) => number;

const getFunctionRootHueFromCache = (cache: Map<number, number>, closestRoot: number) => {
	let hue = cache.get(closestRoot);

	if (hue === undefined) {
		hue = math.random(100) / 100;
		cache.set(closestRoot, hue);
	}

	return hue;
};

const isNaN = (x: number) => x !== x;

export const fractalCalculators = new Map<FractalId, FractalCalculator>([
	[
		FractalId.Mandelbrot,
		(x, y, parameters) => {
			const cReal = (x / parameters.axisSize / parameters.magnification) * 4 - 2;
			const cImaginary = (y / parameters.axisSize / parameters.magnification) * 4 - 2;

			let zReal = 0;
			let zImaginary = 0;

			for (const iteration of $range(1, parameters.maxIterations)) {
				if (modulus(zReal, zImaginary) > parameters.maxStable) return iteration / parameters.maxIterations;

				const zRealTemp = zReal;

				zReal = zReal * zReal - zImaginary * zImaginary + cReal;
				zImaginary = zRealTemp * zImaginary * 2 + cImaginary;
			}

			return -1;
		},
	],

	[
		FractalId.Mandelbar,
		(x, y, parameters) => {
			const cReal = (x / parameters.axisSize / parameters.magnification) * 4 - 2;
			const cImaginary = (y / parameters.axisSize / parameters.magnification) * 4 - 2;

			let zReal = 0;
			let zImaginary = 0;

			for (const iteration of $range(1, parameters.maxIterations)) {
				if (modulus(zReal, zImaginary) > parameters.maxStable) return iteration / parameters.maxIterations;

				const zRealTemp = zReal;

				zReal = zReal * zReal - zImaginary * zImaginary + cReal;
				zImaginary = zRealTemp * zImaginary * -2 + cImaginary;
			}

			return -1;
		},
	],

	[
		FractalId.BurningShip,
		(x, y, parameters) => {
			const facingFactor = parameters.burningShipFacesLeft ? -1 : 1;

			const cReal = (x / parameters.axisSize / parameters.magnification) * (4 * facingFactor) + -2 * facingFactor;
			const cImaginary = (y / parameters.axisSize / parameters.magnification) * -4 + 2;

			let zReal = cReal;
			let zImaginary = cImaginary;

			for (const iteration of $range(1, parameters.maxIterations)) {
				if (modulus(zReal, zImaginary) > parameters.maxStable) return iteration / parameters.maxIterations;

				const zRealTemp = zReal;

				zReal = zReal * zReal - zImaginary * zImaginary + cReal;
				zImaginary = math.abs(zRealTemp * zImaginary * 2) + cImaginary;
			}

			return -1;
		},
	],

	[
		FractalId.Julia,
		(x, y, parameters) => {
			let zReal = (x / parameters.axisSize / parameters.magnification) * 4 - 2;
			let zImaginary = (y / parameters.axisSize / parameters.magnification) * 4 - 2;

			for (const iteration of $range(1, parameters.maxIterations)) {
				if (modulus(zReal, zImaginary) > parameters.maxStable) return iteration / parameters.maxIterations;

				const zRealTemp = zReal;

				zReal = zReal * zReal - zImaginary * zImaginary + parameters.juliaRealConstant;
				zImaginary = zRealTemp * zImaginary * 2 + parameters.juliaImaginaryConstant;
			}

			return -1;
		},
	],

	[
		FractalId.Newton,
		(x, y, parameters) => {
			const data = newtonFunctionData.get(parameters.newtonFunction);
			if (!data) throw `no data found for newton function ${parameters.newtonFunction}`;

			const hasDefinedRoots = "roots" in data;

			let zReal = (x / parameters.axisSize / parameters.magnification) * 4 - 2;
			let zImaginary = (y / parameters.axisSize / parameters.magnification) * 4 - 2;

			for (const iteration of $range(1, parameters.maxIterations)) {
				const [functionReal, functionImaginary] = data.execute(zReal, zImaginary);

				if (isNaN(functionReal) || isNaN(functionImaginary)) {
					return -1;
				}

				const [derivativeReal, derivativeImaginary] = data.derivativeExecute(zReal, zImaginary);

				if (isNaN(derivativeReal) || isNaN(derivativeImaginary)) {
					return -1;
				}

				const [dividedReal, dividedImaginary] = complexDiv(
					functionReal,
					functionImaginary,
					derivativeReal,
					derivativeImaginary,
				);

				const [coefficientAppliedReal, coefficientAppliedImaginary] = complexMul(
					dividedReal,
					dividedImaginary,
					parameters.newtonCoefficientReal,
					parameters.newtonCoefficientImaginary,
				);

				zReal -= coefficientAppliedReal;
				zImaginary -= coefficientAppliedImaginary;

				if (hasDefinedRoots) {
					for (const [rootReal, rootImaginary, rootHue] of data.roots) {
						if (modulus(zReal - rootReal, zImaginary - rootImaginary) < NEWTON_TOLERANCE) {
							return parameters.newtonPreferRootBasisHue ? rootHue : iteration / parameters.maxIterations;
						}
					}

					continue;
				}

				const size = modulus(zReal, zImaginary);
				const closestRoot = data.determineClosestRoot(size);
				if (math.abs(size - closestRoot) >= NEWTON_TOLERANCE) continue;

				return parameters.newtonPreferRootBasisHue
					? getFunctionRootHueFromCache(data.rootHueCache, closestRoot)
					: iteration / parameters.maxIterations;
			}

			return -1;
		},
	],
]);
