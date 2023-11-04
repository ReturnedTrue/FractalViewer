import { MAX_TIME_PER_CALCULATION_SEGMENT } from "shared/constants/fractal";
import { FractalId } from "shared/enums/FractalId";
import { FractalParameters } from "shared/types/FractalParameters";
import { fractalCalculators } from "./FractalCalculators";
import { $error } from "rbxts-transform-debug";
import { modulus } from "client/controllers/CalculationController/ComplexMath";

type FractalSystem = (parameters: FractalParameters, cache: Map<number, Map<number, number>>) => void;

export const defaultFractalSystem: FractalSystem = (parameters, cache) => {
	const calculator = fractalCalculators.get(parameters.fractalId);
	if (!calculator) $error(`No system or calculator defined for fractal ${parameters.fractalId}`);

	const { xOffset, yOffset, axisSize, magnification, maxIterations, maxStable } = parameters;

	let accumulatedTime = 0;

	for (const i of $range(0, axisSize - 1)) {
		const columnStartTime = os.clock();
		const xPosition = i + xOffset;

		let cacheColumn = cache.get(xPosition);

		if (cacheColumn === undefined) {
			cacheColumn = new Map();
			cache.set(xPosition, cacheColumn);
		}

		for (const j of $range(0, axisSize - 1)) {
			const yPosition = j + yOffset;

			if (!cacheColumn.has(yPosition)) {
				// Most commonly used parameters are given like this for efficiency
				const value = calculator(
					xPosition,
					yPosition,
					axisSize,
					magnification,
					maxIterations,
					maxStable,
					parameters,
				);

				cacheColumn.set(yPosition, value);
			}
		}

		accumulatedTime += os.clock() - columnStartTime;

		if (accumulatedTime > MAX_TIME_PER_CALCULATION_SEGMENT) {
			accumulatedTime = 0;

			task.wait();
		}
	}
};

export const fractalSystems = new Map<FractalId, FractalSystem>([
	[
		FractalId.Buddhabrot,
		(parameters, cache) => {
			const { axisSize, xOffset, yOffset } = parameters;

			// Buddhabrot may not generate values for points which are currently displayed
			const fillInEmpty = () => {
				for (const i of $range(0, axisSize - 1)) {
					const xPosition = i + xOffset;
					const cacheColumn = cache.get(xPosition);

					// Knows that the whole column is empty so populates immediately
					if (cacheColumn === undefined) {
						const newColumn = new Map<number, number>();

						for (const j of $range(0, axisSize - 1)) {
							const yPosition = j + yOffset;
							newColumn.set(yPosition, 0);
						}

						cache.set(xPosition, newColumn);

						continue;
					}

					// Checks before populating
					for (const j of $range(0, axisSize - 1)) {
						const yPosition = j + yOffset;

						if (!cacheColumn.has(yPosition)) {
							cacheColumn.set(yPosition, 0);
						}
					}
				}
			};

			if (!cache.isEmpty()) {
				fillInEmpty();
				return;
			}

			const { maxIterations, maxStable, magnification } = parameters;

			const scaledAxis = axisSize * magnification;
			const scaledIterationAxis = scaledAxis - 1;

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

					let cacheColumn = cache.get(x);

					if (cacheColumn === undefined) {
						cacheColumn = new Map();
						cache.set(x, cacheColumn);
					}

					const count = (cacheColumn.get(y) ?? 0) + 1;
					if (count > highestCount) {
						highestCount = count;
					}

					cacheColumn.set(y, count);
				}
			};

			const solveMandelbrotForPoint = (x: number, y: number) => {
				const cReal = (x / axisSize / magnification) * 4 - 2;
				const cImaginary = (y / axisSize / magnification) * 4 - 2;

				let zReal = cReal;
				let zImaginary = cImaginary;

				const valuesIteratedOver = new Array<number>();

				for (const _iteration of $range(1, maxIterations)) {
					if (modulus(zReal, zImaginary) > maxStable) {
						pointEscaped(valuesIteratedOver);
						break;
					}

					const zRealTemp = zReal;

					zReal = zReal * zReal - zImaginary * zImaginary + cReal;
					zImaginary = zRealTemp * zImaginary * 2 + cImaginary;

					valuesIteratedOver.push(zReal, zImaginary);
				}
			};

			let accumulatedTime = 0;

			for (const i of $range(0, scaledIterationAxis)) {
				const columnStartTime = os.clock();

				for (const j of $range(0, scaledIterationAxis)) {
					solveMandelbrotForPoint(i, j);
				}

				accumulatedTime += os.clock() - columnStartTime;

				if (accumulatedTime > MAX_TIME_PER_CALCULATION_SEGMENT) {
					accumulatedTime = 0;

					task.wait();
				}
			}

			// Colored based upon the relative frequency of that point being unstable
			for (const [x, xMap] of cache) {
				const column = cache.get(x)!;

				for (const [y, yValue] of xMap) {
					column.set(y, yValue / highestCount);
				}
			}

			fillInEmpty();
		},
	],
]);
