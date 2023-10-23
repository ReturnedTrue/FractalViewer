import { Controller, OnStart } from "@flamework/core";
import { DEFAULT_FRACTAL_PARAMETERS } from "shared/constants/fractal";
import { $print } from "rbxts-transform-debug";
import { clientStore, connectToStoreChange } from "client/rodux/store";
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

			if (oldState.fractal.partsFolder && fractal.parameters.axisSize !== oldState.fractal.parameters.axisSize) {
				$print("axis size changed");

				this.clearParts(oldState.fractal.partsFolder);
				this.constructParts(fractal.parameters.axisSize);
			}

			if (fractal.hasCacheBeenVoided) {
				$print("cache voided");
				this.calculatedCache.clear();
			}

			this.calculateFractal(fractal);
			this.applyFractal(fractal);
		});

		this.constructParts(DEFAULT_FRACTAL_PARAMETERS.axisSize);
	}

	private constructParts(size: number) {
		const containingFolder = new Instance("Folder");
		const endTimer = beginTimer();

		for (const i of $range(0, size - 1)) {
			const column = [];

			for (const j of $range(0, size - 1)) {
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

		clientStore.dispatch({ type: "setPartsFolder", partsFolder: containingFolder });
	}

	private clearParts(oldFolder: Folder) {
		clientStore.dispatch({ type: "setPartsFolder", partsFolder: undefined });

		let count = 0;

		for (const part of oldFolder.GetChildren()) {
			part.Destroy();

			count++;
			if (count % 10000 === 0) task.wait(0.1);
		}

		oldFolder.Destroy();
		this.parts.clear();
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

		for (const i of $range(0, parameters.axisSize - 1)) {
			const xPosition = i + xOffset;

			const cacheColumn = this.calculatedCache.get(xPosition);
			const partsColumn = this.parts[i];

			for (const j of $range(0, parameters.axisSize - 1)) {
				const yPosition = j + yOffset;
				const hue = (cacheColumn?.get(yPosition) ?? 0) + trueHueShift;

				const color = Color3.fromHSV(hue > 1 ? hue - 1 : hue, 1, 1);

				partsColumn[j].Color = color;
			}
		}

		$print(string.format("complete fractal application (%.2f ms)", endTimer()));
	}
}
