import { Controller, OnStart } from "@flamework/core";
import {
	AXIS_ITERATION_SIZE,
	AXIS_SIZE,
	MAX_ITERATIONS,
	MAX_SECONDS_BEFORE_WAIT,
	MAX_STABLE,
	NEWTON_TOLERANCE,
} from "shared/constants/fractal";
import { $print } from "rbxts-transform-debug";
import { clientStore, connectToStoreChange } from "client/rodux/store";
import { FractalId } from "shared/enums/FractalId";
import { FractalParameters, FractalState } from "client/rodux/reducers/fractal";
import { NewtonFunction } from "shared/enums/NewtonFunction";
import {
	complexSquare,
	complexPow,
	complexSine,
	complexCos,
	complexSize,
	complexDiv,
	complexTan,
} from "client/utility/complex";

type FractalCalculator = (
	x: number,
	y: number,
	magnification: number,
	otherParameters: Omit<FractalParameters, "xOffset" | "yOffset" | "magnification">,
) => number;

type NewtonFunctionData = {
	execute: (real: number, imaginary: number) => LuaTuple<[number, number]>;
	derivativeExecute: (real: number, imaginary: number) => LuaTuple<[number, number]>;
} & ({ roots: Array<[number, number, number]> } | { howCloseToRoot: (size: number) => number });

const newtonFunctionData: Record<NewtonFunction, NewtonFunctionData> = {
	[NewtonFunction.Quadratic]: {
		roots: [
			[-1, 0, 0.1],
			[1, 0, 0.2],
		],

		execute: (real, imaginary) => {
			const [squaredReal, squaredImaginary] = complexSquare(real, imaginary);

			return $tuple(squaredReal - 1, squaredImaginary);
		},

		derivativeExecute: (real, imaginary) => {
			return $tuple(2 * real, 2 * imaginary);
		},
	},

	[NewtonFunction.Cubic]: {
		roots: [
			[1, 0, 0.1],
			[-0.5, math.sqrt(3) / 2, 0.2],
			[-0.5, -math.sqrt(3) / 2, 0.3],
		],

		execute: (real, imaginary) => {
			const [cubedReal, cubedImaginary] = complexPow(real, imaginary, 3);

			return $tuple(cubedReal - 1, cubedImaginary);
		},

		derivativeExecute: (real, imaginary) => {
			const [squaredReal, squaredImaginary] = complexSquare(real, imaginary);

			return $tuple(3 * squaredReal, 3 * squaredImaginary);
		},
	},

	[NewtonFunction.Quartic]: {
		roots: [
			[1, 0, 0.1],
			[-1, 0, 0.2],
			[0, 1, 0.3],
			[0, -1, 0.4],
		],

		execute: (real, imaginary) => {
			const [poweredReal, poweredImaginary] = complexPow(real, imaginary, 4);

			return $tuple(poweredReal - 1, poweredImaginary);
		},

		derivativeExecute: (real, imaginary) => {
			const [cubedReal, cubedImaginary] = complexPow(real, imaginary, 3);

			return $tuple(4 * cubedReal, 4 * cubedImaginary);
		},
	},

	[NewtonFunction.Sine]: {
		howCloseToRoot: (size) => {
			return size % math.pi;
		},

		execute: complexSine,
		derivativeExecute: complexCos,
	},

	[NewtonFunction.Cos]: {
		howCloseToRoot: (size) => {
			return size % (math.pi / 2);
		},

		execute: complexCos,

		// -sin(x)
		derivativeExecute: (real, imaginary) => {
			const [sineReal, sineImaginary] = complexSine(real, imaginary);

			return $tuple(-sineReal, -sineImaginary);
		},
	},

	[NewtonFunction.Tan]: {
		howCloseToRoot: (size) => {
			return size % math.pi;
		},

		execute: complexTan,

		// sec^2(x)
		derivativeExecute: (real, imaginary) => {
			const [cosineReal, cosineImaginary] = complexCos(real, imaginary);
			const [squaredReal, squaredImaginary] = complexSquare(cosineReal, cosineImaginary);

			return $tuple(1 / squaredReal, 1 / squaredImaginary);
		},
	},
};

const fractalCalculators: Record<FractalId, FractalCalculator> = {
	[FractalId.Mandelbrot]: (x, y, magnification) => {
		const cReal = (x / AXIS_SIZE / magnification) * 4 - 2;
		const cImaginary = (y / AXIS_SIZE / magnification) * 4 - 2;

		let zReal = 0.01;
		let zImaginary = 0.01;

		for (const iteration of $range(1, MAX_ITERATIONS)) {
			if (complexSize(zReal, zImaginary) > MAX_STABLE) return iteration / MAX_ITERATIONS;

			const zRealTemp = zReal;

			zReal = zReal * zReal - zImaginary * zImaginary + cReal;
			zImaginary = zRealTemp * zImaginary * 2 + cImaginary;
		}

		return 1;
	},

	[FractalId.BurningShip]: (x, y, magnification) => {
		const cReal = ((AXIS_SIZE - x) / AXIS_SIZE / magnification) * 4 - 2;
		const cImaginary = ((AXIS_SIZE - y) / AXIS_SIZE / magnification) * 4 - 2;

		let zReal = cReal;
		let zImaginary = cImaginary;

		for (const iteration of $range(1, MAX_ITERATIONS)) {
			if (complexSize(zReal, zImaginary) > MAX_STABLE) return iteration / MAX_ITERATIONS;

			const zRealTemp = zReal;

			zReal = zReal * zReal - zImaginary * zImaginary + cReal;
			zImaginary = math.abs(zRealTemp * zImaginary * 2) + cImaginary;
		}

		return 1;
	},

	[FractalId.Julia]: (x, y, magnification, { juliaRealConstant, juliaImaginaryConstant }) => {
		let zReal = (x / AXIS_SIZE / magnification) * 4 - 2;
		let zImaginary = (y / AXIS_SIZE / magnification) * 4 - 2;

		for (const iteration of $range(1, MAX_ITERATIONS)) {
			if (complexSize(zReal, zImaginary) > MAX_STABLE) return iteration / MAX_ITERATIONS;

			const zRealTemp = zReal;

			zReal = zReal * zReal - zImaginary * zImaginary + juliaRealConstant;
			zImaginary = zRealTemp * zImaginary * 2 + juliaImaginaryConstant;
		}

		return 1;
	},

	[FractalId.Newton]: (x, y, magnification, { newtonFunction, newtonCoefficient }) => {
		const functionData = newtonFunctionData[newtonFunction];
		const hasDefinedRoots = "roots" in functionData;

		let zReal = (x / AXIS_SIZE / magnification) * 4 - 2;
		let zImaginary = (y / AXIS_SIZE / magnification) * 4 - 2;

		for (const iteration of $range(1, MAX_ITERATIONS)) {
			const [functionReal, functionImaginary] = functionData.execute(zReal, zImaginary);
			const [derivativeReal, derivativeImaginary] = functionData.derivativeExecute(zReal, zImaginary);

			const [dividedReal, dividedImaginary] = complexDiv(
				functionReal,
				functionImaginary,
				derivativeReal,
				derivativeImaginary,
			);

			zReal -= newtonCoefficient * dividedReal;
			zImaginary -= newtonCoefficient * dividedImaginary;

			if (hasDefinedRoots) {
				for (const [rootReal, rootImaginary, rootHue] of functionData.roots) {
					if (complexSize(zReal - rootReal, zImaginary - rootImaginary) < NEWTON_TOLERANCE) {
						return rootHue;
					}
				}
			} else if (functionData.howCloseToRoot(complexSize(zReal, zImaginary)) < NEWTON_TOLERANCE) {
				return iteration / MAX_ITERATIONS;
			}
		}

		return 1;
	},
};

@Controller()
export class CalculationController implements OnStart {
	private parts = new Array<Array<Part>>();
	private calculatedCache = new Map<number, Map<number, Color3>>();

	onStart() {
		this.constructParts();

		connectToStoreChange(({ fractal }, oldState) => {
			if (!fractal.partsFolder) return;
			if (fractal.parametersLastUpdated === oldState.fractal.parametersLastUpdated) return;

			if (fractal.hasCacheBeenVoided) {
				$print("cache voided");
				this.calculatedCache.clear();
			}

			this.calculateFractal(fractal);
			this.applyFractal(fractal);
		});

		clientStore.dispatch({ type: "updateSingleParameter", name: "fractalId", value: FractalId.Mandelbrot });
	}

	private constructParts() {
		const containingFolder = new Instance("Folder");

		for (const i of $range(0, AXIS_ITERATION_SIZE)) {
			const column = [];

			for (const j of $range(0, AXIS_ITERATION_SIZE)) {
				const part = new Instance("Part");
				part.Name = `(${i}, ${j})`;
				part.Position = new Vector3(i, j, 0);
				part.Size = Vector3.one;
				part.Parent = containingFolder;

				column.push(part);
			}

			this.parts.push(column);

			if (i % 10 === 0) task.wait(0.1);
		}

		$print("complete part construction");
		clientStore.dispatch({ type: "setPartsFolder", partsFolder: containingFolder });
	}

	private calculateFractal({ parameters }: FractalState) {
		const { fractalId, xOffset, yOffset, magnification } = parameters;
		const calculator = fractalCalculators[fractalId];

		let totalCalculationTime = 0;
		let accumulatedCalculationTime = 0;

		for (const i of $range(0, AXIS_ITERATION_SIZE)) {
			const columnStartTime = os.clock();
			const xPosition = i + xOffset;

			let columnCache = this.calculatedCache.get(xPosition);

			if (columnCache === undefined) {
				columnCache = new Map();
				this.calculatedCache.set(xPosition, columnCache);
			}

			for (const j of $range(0, AXIS_ITERATION_SIZE)) {
				const yPosition = j + yOffset;

				if (!columnCache.has(yPosition)) {
					const color = Color3.fromHSV(calculator(xPosition, yPosition, magnification, parameters), 1, 1);
					columnCache.set(yPosition, color);
				}
			}

			accumulatedCalculationTime += os.clock() - columnStartTime;

			if (accumulatedCalculationTime > MAX_SECONDS_BEFORE_WAIT) {
				totalCalculationTime += accumulatedCalculationTime;
				accumulatedCalculationTime = 0;

				task.wait();
			}
		}

		totalCalculationTime += accumulatedCalculationTime;

		$print(string.format("complete fractal calculation (%.2f ms)", totalCalculationTime * 1000));
	}

	private applyFractal({ parameters }: FractalState) {
		const { xOffset, yOffset } = parameters;
		const applicationStartTime = os.clock();

		for (const i of $range(0, AXIS_ITERATION_SIZE)) {
			const xPosition = i + xOffset;

			const columnCache = this.calculatedCache.get(xPosition)!;

			for (const j of $range(0, AXIS_ITERATION_SIZE)) {
				const yPosition = j + yOffset;
				const color = columnCache.get(yPosition)!;

				this.parts[i][j].Color = color;
			}
		}

		const totalApplicationTime = os.clock() - applicationStartTime;

		$print(string.format("complete fractal application (%.2f ms)", totalApplicationTime * 1000));
	}
}
