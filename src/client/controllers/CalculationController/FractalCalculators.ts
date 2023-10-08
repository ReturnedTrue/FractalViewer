import { modulus, complexDiv, complexMul } from "client/utility/complex";
import { AXIS_SIZE, MAX_ITERATIONS, MAX_STABLE, NEWTON_TOLERANCE } from "shared/constants/fractal";
import { FractalId } from "shared/enums/FractalId";
import { FractalParameters } from "shared/types/FractalParameters";
import { NewtonFunctionData, newtonFunctionData } from "./NewtonFunctionData";
import { NewtonFunction } from "shared/enums/NewtonFunction";

type FractalCalculator = (
	x: number,
	y: number,
	magnification: number,
	otherParameters: Omit<FractalParameters, "xOffset" | "yOffset" | "magnification">,
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
		(x, y, magnification) => {
			const cReal = (x / AXIS_SIZE / magnification) * 4 - 2;
			const cImaginary = (y / AXIS_SIZE / magnification) * 4 - 2;

			let zReal = 0.01;
			let zImaginary = 0.01;

			for (const iteration of $range(1, MAX_ITERATIONS)) {
				if (modulus(zReal, zImaginary) > MAX_STABLE) return iteration / MAX_ITERATIONS;

				const zRealTemp = zReal;

				zReal = zReal * zReal - zImaginary * zImaginary + cReal;
				zImaginary = zRealTemp * zImaginary * 2 + cImaginary;
			}

			return 0;
		},
	],

	[
		FractalId.BurningShip,
		(x, y, magnification) => {
			const cReal = ((AXIS_SIZE - x) / AXIS_SIZE / magnification) * 4 - 2;
			const cImaginary = ((AXIS_SIZE - y) / AXIS_SIZE / magnification) * 4 - 2;

			let zReal = cReal;
			let zImaginary = cImaginary;

			for (const iteration of $range(1, MAX_ITERATIONS)) {
				if (modulus(zReal, zImaginary) > MAX_STABLE) return iteration / MAX_ITERATIONS;

				const zRealTemp = zReal;

				zReal = zReal * zReal - zImaginary * zImaginary + cReal;
				zImaginary = math.abs(zRealTemp * zImaginary * 2) + cImaginary;
			}

			return 0;
		},
	],

	[
		FractalId.Julia,
		(x, y, magnification, { juliaRealConstant, juliaImaginaryConstant }) => {
			let zReal = (x / AXIS_SIZE / magnification) * 4 - 2;
			let zImaginary = (y / AXIS_SIZE / magnification) * 4 - 2;

			for (const iteration of $range(1, MAX_ITERATIONS)) {
				if (modulus(zReal, zImaginary) > MAX_STABLE) return iteration / MAX_ITERATIONS;

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
			magnification,
			{ newtonFunction, newtonPreferRootBasisHue, newtonCoefficientReal, newtonCoefficientImaginary },
		) => {
			const data = newtonFunctionData[newtonFunction] as NewtonFunctionData;
			const hasDefinedRoots = "roots" in data;

			let zReal = (x / AXIS_SIZE / magnification) * 4 - 2;
			let zImaginary = (y / AXIS_SIZE / magnification) * 4 - 2;

			for (const iteration of $range(1, MAX_ITERATIONS)) {
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
							return rootHue;
						}
					}
				} else {
					const size = modulus(zReal, zImaginary);
					const closestRoot = data.determineClosestRoot(size);

					if (math.abs(size - closestRoot) < NEWTON_TOLERANCE) {
						return newtonPreferRootBasisHue
							? getFunctionRootHueFromCache(data.rootHueCache, closestRoot)
							: iteration / MAX_ITERATIONS;
					}
				}
			}

			return 0;
		},
	],
]);
