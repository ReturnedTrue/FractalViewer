import { AXIS_ITERATION_SIZE, AXIS_SIZE, MAX_SECONDS_BEFORE_WAIT, MAX_STABLE } from "shared/constants/fractal";
import { FractalId } from "shared/enums/FractalId";
import { FractalParameters } from "shared/types/FractalParameters";
import { fractalCalculators } from "./FractalCalculators";
import { $error } from "rbxts-transform-debug";
import { modulus } from "client/utility/complex";

type FractalSystem = (parameters: FractalParameters, cache: Map<number, Map<number, number>>) => void;

export const defaultFractalSystem: FractalSystem = (parameters, cache) => {
	const calculator = fractalCalculators.get(parameters.fractalId);
	if (!calculator) $error(`No system or calculator defined for fractal ${parameters.fractalId}`);

	const { xOffset, yOffset, maxIterations, magnification } = parameters;

	let accumulatedTime = 0;

	for (const i of $range(0, AXIS_ITERATION_SIZE)) {
		const columnStartTime = os.clock();
		const xPosition = i + xOffset;

		let columnCache = cache.get(xPosition);

		if (columnCache === undefined) {
			columnCache = new Map();
			cache.set(xPosition, columnCache);
		}

		for (const j of $range(0, AXIS_ITERATION_SIZE)) {
			const yPosition = j + yOffset;

			if (!columnCache.has(yPosition)) {
				const value = calculator(xPosition, yPosition, magnification, maxIterations, parameters);
				columnCache.set(yPosition, value);
			}
		}

		accumulatedTime += os.clock() - columnStartTime;

		if (accumulatedTime > MAX_SECONDS_BEFORE_WAIT) {
			accumulatedTime = 0;

			task.wait();
		}
	}
};

export const fractalSystems = new Map<FractalId, FractalSystem>([
	[
		FractalId.Buddhabrot,
		(parameters, cache) => {
			if (!cache.isEmpty()) return;

			const { maxIterations, magnification } = parameters;

			const scaledAxis = AXIS_SIZE * parameters.magnification;
			const scaledIterationAxis = scaledAxis - 1;

			let highestCount = 0;

			const pointEscaped = (valuesIteratedOver: Array<number>) => {
				for (const i of $range(0, valuesIteratedOver.size() - 1, 2)) {
					const zReal = valuesIteratedOver[i];
					const zImaginary = valuesIteratedOver[i + 1];

					const x = math.round(((zReal + 2) / 4) * scaledAxis);
					const y = math.round(((zImaginary + 2) / 4) * scaledAxis);

					if (x < 0 || x > scaledAxis) continue;
					if (y < 0 || y > scaledAxis) continue;

					let column = cache.get(x);

					if (column === undefined) {
						column = new Map();
						cache.set(x, column);
					}

					const count = (column.get(y) ?? 0) + 1;
					if (count > highestCount) {
						highestCount = count;
					}

					column.set(y, count);
				}
			};

			const solveMandelbrotForPoint = (x: number, y: number) => {
				const cReal = (x / AXIS_SIZE / magnification) * 4 - 2;
				const cImaginary = (y / AXIS_SIZE / magnification) * 4 - 2;

				let zReal = 0.01;
				let zImaginary = 0.01;

				const valuesIteratedOver = new Array<number>();

				for (const _iteration of $range(1, maxIterations)) {
					if (modulus(zReal, zImaginary) > MAX_STABLE) {
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

				if (accumulatedTime > MAX_SECONDS_BEFORE_WAIT) {
					accumulatedTime = 0;

					task.wait();
				}
			}

			for (const [x, xMap] of cache) {
				const column = cache.get(x)!;

				for (const [y, yValue] of xMap) {
					column.set(y, yValue / highestCount);
				}
			}
		},
	],
]);
