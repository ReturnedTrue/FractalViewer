import { Controller, OnStart } from "@flamework/core";
import { AXIS_ITERATION_SIZE, DEFAULT_FRACTAL_PARAMETERS, MAX_SECONDS_BEFORE_WAIT } from "shared/constants/fractal";
import { $print } from "rbxts-transform-debug";
import { clientStore, connectToStoreChange } from "client/rodux/store";
import { FractalId } from "shared/enums/FractalId";
import { FractalState } from "client/rodux/reducers/fractal";
import { defaultFractalSystem, fractalSystems } from "./FractalSystems";

export function beginTimer() {
	const startTime = os.clock();

	return () => {
		return (os.clock() - startTime) * 1000;
	};
}

@Controller()
export class CalculationController implements OnStart {
	private parts = new Array<Array<Part>>();
	private calculatedCache = new Map<number, Map<number, number>>();

	onStart() {
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

		const partsFolder = this.constructParts();
		clientStore.dispatch({ type: "setPartsFolder", partsFolder });
	}

	private constructParts() {
		const containingFolder = new Instance("Folder");
		const endTimer = beginTimer();

		for (const i of $range(0, AXIS_ITERATION_SIZE)) {
			const column = [];

			for (const j of $range(0, AXIS_ITERATION_SIZE)) {
				const part = new Instance("Part");
				part.Name = `(${i}, ${j})`;
				part.Position = new Vector3(i, j, 0);
				part.Size = Vector3.one;
				part.Anchored = true;
				part.CanQuery = true;
				part.CanCollide = false;
				part.CanTouch = false;
				part.Parent = containingFolder;

				column.push(part);
			}

			this.parts.push(column);

			if (i % 50 === 0) task.wait(0.1);
		}

		$print(string.format("complete part construction (%.2f ms)", endTimer()));
		return containingFolder;
	}

	private calculateFractal({ parameters }: FractalState) {
		const system = fractalSystems.get(parameters.fractalId) ?? defaultFractalSystem;
		const endTimer = beginTimer();

		system(parameters, this.calculatedCache);

		$print(string.format("complete fractal calculation (%.2f ms)", endTimer()));
	}

	private applyFractal({ parameters }: FractalState) {
		const { xOffset, yOffset, hueShift } = parameters;
		const endTimer = beginTimer();

		const trueHueShift = hueShift / 360;

		for (const i of $range(0, AXIS_ITERATION_SIZE)) {
			const xPosition = i + xOffset;

			const column = this.calculatedCache.get(xPosition);

			for (const j of $range(0, AXIS_ITERATION_SIZE)) {
				const yPosition = j + yOffset;
				const hue = (column?.get(yPosition) ?? 0) + trueHueShift;

				const color = Color3.fromHSV(hue > 1 ? hue - 1 : hue, 1, 1);

				this.parts[i][j].Color = color;
			}
		}

		$print(string.format("complete fractal application (%.2f ms)", endTimer()));
	}
}
