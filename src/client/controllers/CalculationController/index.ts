import { Controller, OnStart } from "@flamework/core";
import {
	DEFAULT_FRACTAL_PARAMETERS,
	MAX_PARTS_PER_CREATION_SEGMENT,
	MAX_PARTS_PER_DELETION_SEGMENT,
} from "shared/constants/fractal";
import { $print } from "rbxts-transform-debug";
import { clientStore, connectToStoreChange } from "client/rodux/store";
import { FractalState } from "client/rodux/reducers/fractal";
import { defaultFractalSystem, fractalSystems } from "./FractalSystems";
import { InterfaceMode } from "shared/enums/InterfaceMode";
import { FractalParameters } from "shared/types/FractalParameters";

export function beginTimer() {
	const startTime = os.clock();

	return () => {
		return string.format("(%.2f ms)", (os.clock() - startTime) * 1000);
	};
}

@Controller()
export class CalculationController implements OnStart {
	// The folder which holds all the displayed parts
	private containingFolder = new Instance("Folder");

	// Stores the displayed parts in a 2D array
	private partsGrid = new Array<Array<Part>>();

	// Stores the columns for each row, and each contained value is the calculated hue
	// Cache can be voided by most parameters, all pixels must be recalculated
	private hueCache = new Map<number, Map<number, number>>();

	onStart() {
		connectToStoreChange(({ fractal }, { fractal: oldFractal }) => {
			if (fractal.parametersLastUpdated === oldFractal.parametersLastUpdated) return;

			const { parameters } = fractal;
			const { parameters: oldParameters } = oldFractal;

			let viewAfterApplication = false;

			// First render
			if (oldFractal.parametersLastUpdated === undefined) {
				$print("beginning first render");

				this.constructParts(parameters.axisSize);
				viewAfterApplication = true;
			}

			// If the parts are viewed and the axis size has changed, recreate the view
			if (oldFractal.interfaceMode !== InterfaceMode.Hidden && oldParameters.axisSize !== parameters.axisSize) {
				$print("axis size changed");

				clientStore.dispatch({ type: "changeViewingStatus", isViewed: false });
				this.clearParts(oldParameters.axisSize);

				this.constructParts(parameters.axisSize);
				viewAfterApplication = true;
			}

			if (fractal.hasCacheBeenVoided) {
				$print("cache voided");
				this.hueCache.clear();
			}

			this.calculateFractal(parameters);
			this.applyFractal(parameters);

			if (viewAfterApplication) {
				task.wait();
				clientStore.dispatch({ type: "changeViewingStatus", isViewed: true });
			}
		});

		clientStore.dispatch({ type: "setPartsFolder", partsFolder: this.containingFolder });
		clientStore.dispatch({ type: "requestRender" });
	}

	private constructParts(axisSize: number) {
		const endTimer = beginTimer();

		let createdCount = 0;

		for (const i of $range(0, axisSize - 1)) {
			const column = [];

			for (const j of $range(0, axisSize - 1)) {
				const part = new Instance("Part");
				part.Name = `(${i}, ${j})`;
				part.Position = new Vector3(i, j, 0);
				part.Size = Vector3.one;
				part.Anchored = true;
				part.CanQuery = false;
				part.CanTouch = false;
				part.CanCollide = false;
				part.Parent = this.containingFolder;

				column.push(part);
				createdCount++;

				if (createdCount >= MAX_PARTS_PER_CREATION_SEGMENT) {
					createdCount = 0;
					task.wait();
				}
			}

			this.partsGrid.push(column);
		}

		$print("complete part construction", endTimer());
	}

	private clearParts(axisSize: number) {
		const endTimer = beginTimer();

		let deletedCount = 0;

		for (const i of $range(0, axisSize - 1)) {
			const partsColumn = this.partsGrid[i];

			for (const j of $range(0, axisSize - 1)) {
				const part = partsColumn[j];

				part.Destroy();
				deletedCount++;

				if (deletedCount >= MAX_PARTS_PER_DELETION_SEGMENT) {
					deletedCount = 0;
					task.wait();
				}
			}

			delete this.partsGrid[i];
		}

		$print("complete part deletion", endTimer());
	}

	private calculateFractal(parameters: FractalParameters) {
		// A fractal can either have a system which defines its own behaviour and updates the cache
		// Or a calculator which is ran by the default system for each pixel
		const system = fractalSystems.get(parameters.fractalId) ?? defaultFractalSystem;
		const endTimer = beginTimer();

		system(parameters, this.hueCache);

		$print("complete fractal calculation", endTimer());
	}

	private applyFractal({ xOffset, yOffset, hueShift, axisSize }: FractalParameters) {
		const endTimer = beginTimer();

		const trueHueShift = hueShift / 360;

		for (const i of $range(0, axisSize - 1)) {
			const xPosition = i + xOffset;

			const cacheColumn = this.hueCache.get(xPosition);
			const partsColumn = this.partsGrid[i];

			for (const j of $range(0, axisSize - 1)) {
				const yPosition = j + yOffset;
				const hue = (cacheColumn?.get(yPosition) ?? 0) + trueHueShift;

				const color = Color3.fromHSV(hue > 1 ? hue - 1 : hue, 1, 1);

				partsColumn[j].Color = color;
			}
		}

		$print("complete fractal application", endTimer());
	}
}
