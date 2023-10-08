import {
	AXIS_ITERATION_SIZE,
	AXIS_SIZE,
	MAX_ITERATIONS,
	MAX_SECONDS_BEFORE_WAIT,
	MAX_STABLE,
} from "shared/constants/fractal";
import { FractalId } from "shared/enums/FractalId";
import { FractalParameters } from "shared/types/FractalParameters";
import { fractalCalculators } from "./FractalCalculators";
import { $error } from "rbxts-transform-debug";
import { modulus } from "client/utility/complex";

type FractalSystem = (parameters: FractalParameters, cache: Map<number, Map<number, number>>) => void;

export const defaultFractalSystem: FractalSystem = (parameters, cache) => {
	const calculator = fractalCalculators.get(parameters.fractalId);
	if (!calculator) $error(`Fractal system did not find a calculator for fractal ${parameters.fractalId}`);

	let accumulatedTime = 0;

	for (const i of $range(0, AXIS_ITERATION_SIZE)) {
		const columnStartTime = os.clock();
		const xPosition = i + parameters.xOffset;

		let columnCache = cache.get(xPosition);

		if (columnCache === undefined) {
			columnCache = new Map();
			cache.set(xPosition, columnCache);
		}

		for (const j of $range(0, AXIS_ITERATION_SIZE)) {
			const yPosition = j + parameters.yOffset;

			if (!columnCache.has(yPosition)) {
				const value = calculator(xPosition, yPosition, parameters.magnification, parameters);
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
			// Temporary
			if (!cache.isEmpty()) cache.clear();

			let highestCount = 0;

			// TODO debug and solve magnification issues with buddhabrot

			const pointEscaped = (valuesIteratedOver: Array<number>) => {
				for (const i of $range(0, valuesIteratedOver.size() - 1, 2)) {
					const zReal = valuesIteratedOver[i];
					const zImaginary = valuesIteratedOver[i + 1];

					const x = math.round(((zReal + 2) / 4) * AXIS_SIZE) / parameters.magnification;
					// eslint-disable-next-line prettier/prettier
					const y = math.round(((zImaginary + 2) / 4) * AXIS_SIZE) / parameters.magnification;

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
				const cReal = (x / AXIS_SIZE / parameters.magnification) * 4 - 2;
				const cImaginary = (y / AXIS_SIZE / parameters.magnification) * 4 - 2;

				let zReal = 0.01;
				let zImaginary = 0.01;

				const valuesIteratedOver = new Array<number>();

				for (const _iteration of $range(1, MAX_ITERATIONS)) {
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

			for (const i of $range(0, AXIS_ITERATION_SIZE)) {
				const columnStartTime = os.clock();

				for (const j of $range(0, AXIS_ITERATION_SIZE)) {
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
