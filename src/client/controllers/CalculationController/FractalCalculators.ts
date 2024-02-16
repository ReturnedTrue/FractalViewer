import { modulus, complexDiv, complexMul } from "client/math/complex";
import { NEWTON_TOLERANCE } from "shared/constants/fractal";
import { FractalId } from "shared/enums/FractalId";
import { FractalParameters } from "shared/types/FractalParameters";
import { newtonFunctionData } from "./NewtonFunctionData";
import { resolveHue, resolveRootHueFromCache } from "./CommonFunctions";
import { $error } from "rbxts-transform-debug";

type FractalCalculatorReceivedParameters = Omit<FractalParameters, "offsetX" | "offsetY">;
type FractalCalculator = (x: number, y: number, parameters: FractalCalculatorReceivedParameters) => number;

type FractalStepFunction = (
	zReal: number,
	zImaginary: number,
	realConstant: number,
	imaginaryConstant: number,
) => LuaTuple<[number, number]>;

export const fractalStepFunctions = new Map<FractalId, FractalStepFunction>([
	[
		FractalId.Mandelbrot,
		(zReal, zImaginary, realConstant, imaginaryConstant) => {
			return $tuple(
				zReal * zReal - zImaginary * zImaginary + realConstant,
				zReal * zImaginary * 2 + imaginaryConstant,
			);
		},
	],

	[
		FractalId.Mandelbar,
		(zReal, zImaginary, realConstant, imaginaryConstant) => {
			return $tuple(
				zReal * zReal - zImaginary * zImaginary + realConstant,
				zReal * zImaginary * -2 + imaginaryConstant,
			);
		},
	],

	[
		FractalId.BurningShip,
		(zReal, zImaginary, realConstant, imaginaryConstant) => {
			return $tuple(
				zReal * zReal - zImaginary * zImaginary - realConstant,
				math.abs(zReal * zImaginary * 2) - imaginaryConstant,
			);
		},
	],
]);

const withStepFunction = (fractalId: FractalId): [FractalId, FractalCalculator] => {
	const step = fractalStepFunctions.get(fractalId);
	if (!step) $error(`could not find step function for fractal: ${fractalId}`);

	return [
		fractalId,
		(x, y, parameters) => {
			const cReal = (x / parameters.axisSize / parameters.magnification) * 4 - 2;
			const cImaginary = (y / parameters.axisSize / parameters.magnification) * 4 - 2;

			let zReal = 0;
			let zImaginary = 0;

			for (const iteration of $range(1, parameters.maxIterations)) {
				const distance = modulus(zReal, zImaginary);
				if (distance > parameters.maxStable) return resolveHue(parameters, iteration, distance);

				[zReal, zImaginary] = step(zReal, zImaginary, cReal, cImaginary);
			}

			return -1;
		},
	];
};

export const fractalCalculators = new Map<FractalId, FractalCalculator>([
	withStepFunction(FractalId.Mandelbrot),
	withStepFunction(FractalId.Mandelbar),
	withStepFunction(FractalId.BurningShip),

	[
		FractalId.Julia,
		(x, y, parameters) => {
			let zReal = (x / parameters.axisSize / parameters.magnification) * 4 - 2;
			let zImaginary = (y / parameters.axisSize / parameters.magnification) * 4 - 2;

			const step = fractalStepFunctions.get(parameters.juliaCorrespondingSet);
			if (!step) $error(`could not find step function for fractal: ${parameters.juliaCorrespondingSet}`);

			for (const iteration of $range(1, parameters.maxIterations)) {
				const distance = modulus(zReal, zImaginary);
				if (distance > parameters.maxStable) return resolveHue(parameters, iteration, distance);

				[zReal, zImaginary] = step(
					zReal,
					zImaginary,
					parameters.juliaRealConstant,
					parameters.juliaImaginaryConstant,
				);
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
					? resolveRootHueFromCache(data.rootHueCache, closestRoot)
					: iteration / parameters.maxIterations;
			}

			return -1;
		},
	],
]);
