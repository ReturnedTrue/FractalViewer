import { Controller, OnStart } from "@flamework/core";
import { AXIS_ITERATION_SIZE, AXIS_SIZE, MAX_ITERATIONS, MAX_STABLE } from "shared/constants/fractal";
import { $print } from "rbxts-transform-debug";
import { clientStore, connectToStoreChange } from "client/rodux/store";
import { FractalId } from "shared/enums/fractal";
import { FractalState } from "client/rodux/reducers/fractal";

type FractalCalculator = (x: number, y: number, magnification: number) => number;

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

		return x;
	},

	[FractalId.Julia]: (x, y) => {
		return x;
	},
};

@Controller()
export class CalculationController implements OnStart {
	private parts = new Array<Array<Part>>();

	onStart() {
		this.constructParts();

		connectToStoreChange(({ fractal }, oldState) => {
			if (fractal.parametersLastUpdated === oldState.fractal.parametersLastUpdated) return;

			this.calculateFractal(fractal);
		});

		clientStore.dispatch({ type: "setFractal", fractalId: FractalId.BurningShip });
	}

	private constructParts() {
		$print("commencing part construction");

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

		$print("parts constructed");
		clientStore.dispatch({ type: "setPartsFolder", partsFolder: containingFolder });
	}

	private calculateFractal(fractal: FractalState) {
		const { fractalId, parameters } = fractal;
		if (fractalId === undefined) return;

		const calculator = fractalCalculators[fractalId];
		const startTime = os.clock();

		for (const i of $range(0, AXIS_ITERATION_SIZE)) {
			for (const j of $range(0, AXIS_ITERATION_SIZE)) {
				const hue = calculator(i + parameters.xOffset, j + parameters.yOffset, parameters.magnification);

				this.parts[i][j].Color = Color3.fromHSV(hue, 1, 1);
			}
		}

		const totalTime = (os.clock() - startTime) * 1000;
		const outputString = string.format("fractal %d calculated in %.2f ms", fractalId, totalTime);
		$print(outputString);
	}
}
