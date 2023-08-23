import { Controller, OnStart } from "@flamework/core";
import { AXIS_ITERATION_SIZE, AXIS_SIZE, MAX_ITERATIONS, MAX_STABLE } from "shared/constants/fractal";
import { $print } from "rbxts-transform-debug";
import { clientStore, connectToStoreChange } from "client/rodux/store";
import { FractalId } from "shared/enums/fractal";
import { FractalParameters, FractalState } from "client/rodux/reducers/fractal";

type FractalCalculator = (
	x: number,
	y: number,
	magnification: number,
	otherParameters: Omit<FractalParameters, "xOffset" | "yOffset" | "magnification">,
) => number;

const getComplexSize = (real: number, imaginary: number) => math.sqrt(real * real + imaginary * imaginary);

const fractalCalculators: Record<FractalId, FractalCalculator> = {
	[FractalId.Mandelbrot]: (x, y, magnification) => {
		const cReal = (x / AXIS_SIZE / magnification) * 4 - 2;
		const cImaginary = (y / AXIS_SIZE / magnification) * 4 - 2;

		let zReal = 0.01;
		let zImaginary = 0.01;

		for (const iteration of $range(1, MAX_ITERATIONS)) {
			if (getComplexSize(zReal, zImaginary) > MAX_STABLE) return iteration / MAX_ITERATIONS;

			const zRealTemp = zReal;

			// (a + bi)(a + bi)
			// 		= a^2 + (2ab)i + (b^2)(i^2)
			// 		= (a^2 - b^2) + (2ab)i
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
			if (getComplexSize(zReal, zImaginary) > MAX_STABLE) return iteration / MAX_ITERATIONS;

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
			if (getComplexSize(zReal, zImaginary) > MAX_STABLE) return iteration / MAX_ITERATIONS;

			const zRealTemp = zReal;

			zReal = zReal * zReal - zImaginary * zImaginary + juliaRealConstant;
			zImaginary = zRealTemp * zImaginary * 2 + juliaImaginaryConstant;
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

			this.calculateAndViewFractal(fractal);
		});

		clientStore.dispatch({ type: "setFractal", fractalId: FractalId.BurningShip });
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

	private calculateAndViewFractal(fractal: FractalState) {
		const { fractalId, parameters } = fractal;
		if (fractalId === undefined) return;

		const { xOffset, yOffset, magnification } = parameters;
		const calculator = fractalCalculators[fractalId];

		const calculationStartTime = os.clock();

		for (const i of $range(0, AXIS_ITERATION_SIZE)) {
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
		}

		$print(string.format("complete fractal calculation (%.2f ms)", (os.clock() - calculationStartTime) * 1000));

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

		$print(string.format("complete fractal application (%.2f ms)", (os.clock() - applicationStartTime) * 1000));
	}
}
