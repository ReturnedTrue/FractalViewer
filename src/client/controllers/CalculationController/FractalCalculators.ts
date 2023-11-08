import { modulus, complexDiv, complexMul, complexPow } from "client/controllers/CalculationController/ComplexMath";
import { NEWTON_TOLERANCE } from "shared/constants/fractal";
import { FractalId } from "shared/enums/FractalId";
import { FractalParameters } from "shared/types/FractalParameters";
import { newtonFunctionData } from "./NewtonFunctionData";

type FractalCalculator = (
	x: number,
	y: number,
	axisSize: number,
	magnification: number,
	maxIterations: number,
	maxStable: number,
	otherParameters: Omit<
		FractalParameters,
		"xOffset" | "yOffset" | "axisSize" | "magnification" | "maxIterations" | "maxStable"
	>,
) => number;

const getFunctionRootHueFromCache = (cache: Map<number, number>, closestRoot: number) => {
	let hue = cache.get(closestRoot);

	if (hue === undefined) {
		hue = math.random(100) / 100;
		cache.set(closestRoot, hue);
	}

	return hue;
};

export const fractalCalculators = new Map<FractalId, FractalCalculator>([
	[
		FractalId.Mandelbrot,
		(x, y, axisSize, magnification, maxIterations, maxStable) => {
			const cReal = (x / axisSize / magnification) * 4 - 2;
			const cImaginary = (y / axisSize / magnification) * 4 - 2;

			let zReal = 0;
			let zImaginary = 0;

			for (const iteration of $range(1, maxIterations)) {
				if (modulus(zReal, zImaginary) > maxStable) return iteration / maxIterations;

				const zRealTemp = zReal;

				zReal = zReal * zReal - zImaginary * zImaginary + cReal;
				zImaginary = zRealTemp * zImaginary * 2 + cImaginary;
			}

			return 0;
		},
	],

	[
		FractalId.BurningShip,
		(x, y, axisSize, magnification, maxIterations, maxStable, { burningShipFacesLeft }) => {
			const facingFactor = burningShipFacesLeft ? -1 : 1;

			const cReal = (x / axisSize / magnification) * (4 * facingFactor) + -2 * facingFactor;
			const cImaginary = (y / axisSize / magnification) * -4 + 2;

			let zReal = cReal;
			let zImaginary = cImaginary;

			for (const iteration of $range(1, maxIterations)) {
				if (modulus(zReal, zImaginary) > maxStable) return iteration / maxIterations;

				const zRealTemp = zReal;

				zReal = zReal * zReal - zImaginary * zImaginary + cReal;
				zImaginary = math.abs(zRealTemp * zImaginary * 2) + cImaginary;
			}

			return 0;
		},
	],

	[
		FractalId.Julia,
		(x, y, axisSize, magnification, maxIterations, maxStable, { juliaRealConstant, juliaImaginaryConstant }) => {
			let zReal = (x / axisSize / magnification) * 4 - 2;
			let zImaginary = (y / axisSize / magnification) * 4 - 2;

			for (const iteration of $range(1, maxIterations)) {
				if (modulus(zReal, zImaginary) > maxStable) return iteration / maxIterations;

				const zRealTemp = zReal;

				zReal = zReal * zReal - zImaginary * zImaginary + juliaRealConstant;
				zImaginary = zRealTemp * zImaginary * 2 + juliaImaginaryConstant;
			}

			return 0;
		},
	],

	[
		FractalId.Newton,
		(
			x,
			y,
			axisSize,
			magnification,
			maxIterations,
			_maxStable,
			{ newtonFunction, newtonPreferRootBasisHue, newtonCoefficientReal, newtonCoefficientImaginary },
		) => {
			const data = newtonFunctionData.get(newtonFunction);
			if (!data) throw `no data found for newton function ${newtonFunction}`;

			const hasDefinedRoots = "roots" in data;

			let zReal = (x / axisSize / magnification) * 4 - 2;
			let zImaginary = (y / axisSize / magnification) * 4 - 2;

			for (const iteration of $range(1, maxIterations)) {
				const [functionReal, functionImaginary] = data.execute(zReal, zImaginary);
				const [derivativeReal, derivativeImaginary] = data.derivativeExecute(zReal, zImaginary);

				const [dividedReal, dividedImaginary] = complexDiv(
					functionReal,
					functionImaginary,
					derivativeReal,
					derivativeImaginary,
				);

				const [coefficientAppliedReal, coefficientAppliedImaginary] = complexMul(
					dividedReal,
					dividedImaginary,
					newtonCoefficientReal,
					newtonCoefficientImaginary,
				);

				zReal -= coefficientAppliedReal;
				zImaginary -= coefficientAppliedImaginary;

				if (hasDefinedRoots) {
					for (const [rootReal, rootImaginary, rootHue] of data.roots) {
						if (modulus(zReal - rootReal, zImaginary - rootImaginary) < NEWTON_TOLERANCE) {
							return newtonPreferRootBasisHue ? rootHue : iteration / maxIterations;
						}
					}

					continue;
				}

				const size = modulus(zReal, zImaginary);
				const closestRoot = data.determineClosestRoot(size);
				if (math.abs(size - closestRoot) >= NEWTON_TOLERANCE) continue;

				/// NaN occurred
				if (closestRoot !== closestRoot) {
					return 0;
				}

				return newtonPreferRootBasisHue
					? getFunctionRootHueFromCache(data.rootHueCache, closestRoot)
					: iteration / maxIterations;
			}

			return 0;
		},
	],
]);
