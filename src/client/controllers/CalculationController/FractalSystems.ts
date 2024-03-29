import { MAX_TIME_PER_CALCULATION_PART } from "shared/constants/fractal";
import { FractalId } from "shared/enums/FractalId";
import { FractalParameters } from "shared/types/FractalParameters";
import { fractalCalculators } from "./FractalCalculators";
import { $warn } from "rbxts-transform-debug";
import { modulus } from "client/math/complex";
import { Dependency } from "@flamework/core";
import { InterpretController } from "../InterpretController";
import { ExpressionVariableMap, ExpressionEvaluator } from "../InterpretController/ExpressionEvaluator";
import { barnsleyFernData } from "./BarnsleyFernData";
import { resolveHue } from "./CommonFunctions";

type FractalCache = Map<number, Map<number, number>>;
type FractalSystem = (parameters: FractalParameters, cache: FractalCache) => void;

const fillInMissedPoints = (parameters: FractalParameters, cache: FractalCache, value: number) => {
	for (const i of $range(0, parameters.axisSize - 1)) {
		const xPosition = i + parameters.offsetX;
		const cacheColumn = cache.get(xPosition);

		// Knows that the whole column is empty so populates immediately
		if (cacheColumn === undefined) {
			const newColumn = new Map<number, number>();

			for (const j of $range(0, parameters.axisSize - 1)) {
				const yPosition = j + parameters.offsetY;
				newColumn.set(yPosition, value);
			}

			cache.set(xPosition, newColumn);

			continue;
		}

		// Checks before populating
		for (const j of $range(0, parameters.axisSize - 1)) {
			const yPosition = j + parameters.offsetY;

			if (!cacheColumn.has(yPosition)) {
				cacheColumn.set(yPosition, value);
			}
		}
	}
};

const getCacheColumn = (cache: FractalCache, x: number) => {
	let cacheColumn = cache.get(x);

	if (cacheColumn === undefined) {
		cacheColumn = new Map();
		cache.set(x, cacheColumn);
	}

	return cacheColumn;
};

const createTimeAccumulator = () => {
	let currentAccumulated = 0;
	let startedSegmentAt: number | false = false;

	const startSegment = () => (startedSegmentAt = os.clock());

	const finishSegment = () => {
		if (startedSegmentAt === false) {
			$warn("attempted to finish a segment after not starting one");
			return;
		}

		const segmentTime = os.clock() - startedSegmentAt;
		startedSegmentAt = false;

		currentAccumulated += segmentTime;

		if (currentAccumulated >= MAX_TIME_PER_CALCULATION_PART) {
			currentAccumulated = 0;
			task.wait();
		}
	};

	return $tuple(startSegment, finishSegment);
};

export const defaultFractalSystem: FractalSystem = (parameters, cache) => {
	const calculator = fractalCalculators.get(parameters.fractalId);

	if (!calculator) {
		throw "fractal not defined in code";
	}

	const [startSegment, finishSegment] = createTimeAccumulator();

	for (const baseX of $range(0, parameters.axisSize - 1)) {
		const positionX = baseX + parameters.offsetX;
		const cacheColumn = getCacheColumn(cache, positionX);

		startSegment();

		for (const baseY of $range(0, parameters.axisSize - 1)) {
			const positionY = baseY + parameters.offsetY;

			if (!cacheColumn.has(positionY)) {
				const value = calculator(positionX, positionY, parameters);
				cacheColumn.set(positionY, value);
			}
		}

		finishSegment();
	}
};

export const fractalSystems = new Map<FractalId, FractalSystem>([
	[
		FractalId.Custom,
		(parameters, cache) => {
			const interpretController = Dependency<InterpretController>();

			const initialEvaluator = interpretController.getEvaluator(parameters.customInitialValueExpression);
			const initialVariables: ExpressionVariableMap = new Map();

			const calculationEvaluator = interpretController.getEvaluator(parameters.customCalculationExpression);
			const calculationVariables: ExpressionVariableMap = new Map();

			const [startSegment, finishSegment] = createTimeAccumulator();

			const calculateAtPoint = (x: number, y: number) => {
				const cValue: [number, number] = [
					(x / parameters.axisSize / parameters.magnification) * 4 - 2,
					(y / parameters.axisSize / parameters.magnification) * 4 - 2,
				];

				initialVariables.set("c", cValue);
				initialVariables.set("x", [x, 0]);
				initialVariables.set("y", [y, 0]);

				calculationVariables.set("c", cValue);
				calculationVariables.set("x", [x, 0]);
				calculationVariables.set("y", [y, 0]);

				let zValue = initialEvaluator.run(initialVariables);

				for (const iteration of $range(1, parameters.maxIterations)) {
					const distance = modulus(zValue[0], zValue[1]);

					if (distance > parameters.maxStable) {
						return resolveHue(parameters, iteration, distance);
					}

					calculationVariables.set("z", zValue);
					calculationVariables.set("n", [iteration, 0]);

					zValue = calculationEvaluator.run(calculationVariables);
				}

				return -1;
			};

			for (const baseX of $range(0, parameters.axisSize - 1)) {
				const positionX = baseX + parameters.offsetX;

				const cacheColumn = getCacheColumn(cache, positionX);

				startSegment();

				for (const baseY of $range(0, parameters.axisSize - 1)) {
					const positionY = baseY + parameters.offsetY;

					if (!cacheColumn.has(positionY)) {
						const value = calculateAtPoint(positionX, positionY);

						cacheColumn.set(positionY, value);
					}
				}

				finishSegment();
			}
		},
	],

	[
		FractalId.Buddhabrot,
		(parameters, cache) => {
			if (!cache.isEmpty()) {
				fillInMissedPoints(parameters, cache, -1);

				return;
			}

			const scaledAxis = parameters.axisSize * parameters.magnification;
			const scaledIterationAxis = scaledAxis - 1;

			const [startSegment, finishSegment] = createTimeAccumulator();

			let highestCount = 0;

			// Values are stored in the format [real1, imaginary1, real2, imaginary2, ...]
			const pointEscaped = (valuesIteratedOver: Array<number>) => {
				for (const i of $range(0, valuesIteratedOver.size() - 1, 2)) {
					const zReal = valuesIteratedOver[i];
					const zImaginary = valuesIteratedOver[i + 1];

					const x = math.round(((zReal + 2) / 4) * scaledAxis);
					const y = math.round(((zImaginary + 2) / 4) * scaledAxis);

					if (x < 0 || x > scaledAxis) continue;
					if (y < 0 || y > scaledAxis) continue;

					const cacheColumn = getCacheColumn(cache, x);

					const count = (cacheColumn.get(y) ?? 0) + 1;
					if (count > highestCount) {
						highestCount = count;
					}

					cacheColumn.set(y, count);
				}
			};

			const solveMandelbrotForPoint = (x: number, y: number) => {
				const cReal = (x / parameters.axisSize / parameters.magnification) * 4 - 2;
				const cImaginary = (y / parameters.axisSize / parameters.magnification) * 4 - 2;

				let zReal = 0;
				let zImaginary = 0;

				const valuesIteratedOver = new Array<number>();

				for (const _iteration of $range(1, parameters.maxIterations)) {
					if (modulus(zReal, zImaginary) > parameters.maxStable) {
						pointEscaped(valuesIteratedOver);
						break;
					}

					const zRealTemp = zReal;

					zReal = zReal * zReal - zImaginary * zImaginary + cReal;
					zImaginary = zRealTemp * zImaginary * 2 + cImaginary;

					valuesIteratedOver.push(zReal, zImaginary);
				}
			};

			for (const x of $range(0, scaledIterationAxis)) {
				startSegment();

				for (const y of $range(0, scaledIterationAxis)) {
					solveMandelbrotForPoint(x, y);
				}

				finishSegment();
			}

			// Colored based upon the relative frequency of that point being unstable
			for (const [x, xMap] of cache) {
				const column = cache.get(x)!;

				for (const [y, yValue] of xMap) {
					column.set(y, yValue / highestCount);
				}
			}

			fillInMissedPoints(parameters, cache, -1);
		},
	],

	[
		FractalId.BarnsleyFern,
		(parameters, cache) => {
			if (!cache.isEmpty()) {
				fillInMissedPoints(parameters, cache, -2);

				return;
			}

			const fernData = barnsleyFernData.get(parameters.barnsleyFernName);
			if (!fernData) throw `could not find data for fern: ${parameters.barnsleyFernName}`;

			let x = 0;
			let y = 0;

			for (const _iteration of $range(1, parameters.maxIterations * parameters.axisSize)) {
				const selectedProbability = math.random();

				let accumulatedProbability = 0;

				for (const terms of fernData.possibleTerms) {
					accumulatedProbability += terms.probability;

					if (accumulatedProbability > selectedProbability) {
						x = terms.a * x + terms.b * y + terms.e;
						y = terms.c * x + terms.d * y + terms.f;

						break;
					}
				}

				const correctedX = (x + fernData.correctionalX) / fernData.correctionalDenominator;
				const correctedY = (y + fernData.correctionalY) / fernData.correctionalDenominator;

				const centeringX = (parameters.axisSize * parameters.magnification) / 2;

				const screenX = math.round(correctedX * parameters.magnification * parameters.axisSize) + centeringX;
				const screenY = math.round(correctedY * parameters.magnification * parameters.axisSize);

				const cacheColumn = getCacheColumn(cache, screenX);
				cacheColumn.set(screenY, 0.33);
			}

			fillInMissedPoints(parameters, cache, -2);
		},
	],
]);
