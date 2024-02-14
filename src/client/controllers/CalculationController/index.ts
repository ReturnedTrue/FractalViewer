import { Controller, OnStart } from "@flamework/core";
import {
	MAX_PARTS_PER_CREATION_SEGMENT,
	MAX_PARTS_PER_DELETION_SEGMENT,
	MAX_TIME_PER_CALCULATION_ENTIRETY,
} from "shared/constants/fractal";
import { $print, $warn } from "rbxts-transform-debug";
import { clientStore, connectToStoreChange } from "client/rodux/store";
import { defaultFractalSystem, fractalSystems } from "./FractalSystems";
import { InterfaceMode } from "client/enums/InterfaceMode";
import { FractalParameters } from "shared/types/FractalParameters";
import { NotifcationData } from "client/types/NotificationData";
import { beginTimer } from "./CommonFunctions";
import { VERBOSE_DEBUG_MODE } from "shared/constants/core";

const blackColor = new Color3();
const whiteColor = new Color3(1, 1, 1);

@Controller()
export class CalculationController implements OnStart {
	// The folder which holds all the displayed parts
	private containingFolder = new Instance("Folder");

	// Stores the displayed parts in a 2D array
	private partsGrid = new Array<Array<Part>>();

	// Stores the columns for each row, and each contained value is the calculated hue
	// Cache can be voided by most parameters, at which all pixels must be recalculated
	private hueCache = new Map<number, Map<number, number>>();

	onStart() {
		clientStore.dispatch({ type: "setPartsFolder", partsFolder: this.containingFolder });

		connectToStoreChange((state, oldState) => {
			const fractal = state.fractal;
			const oldFractal = oldState.fractal;
			if (fractal.parametersLastUpdated === oldFractal.parametersLastUpdated) return;

			const parameters = fractal.parameters;
			const oldParameters = oldFractal.parameters;

			const endTimer = beginTimer();
			VERBOSE_DEBUG_MODE && $print("begin render of", parameters.fractalId, "fractal");

			let viewAfterApplication = false;

			// First render
			if (oldFractal.parametersLastUpdated === false) {
				this.constructParts(parameters.axisSize);
				viewAfterApplication = true;

				// If the parts are viewed and the axis size has changed, recreate the view
			} else if (
				oldFractal.interfaceMode !== InterfaceMode.Hidden &&
				oldParameters.axisSize !== parameters.axisSize
			) {
				this.handleAxisSizeChange(oldParameters.axisSize, parameters.axisSize);
				viewAfterApplication = true;
			}

			if (fractal.hasCacheBeenVoided) {
				VERBOSE_DEBUG_MODE && $print("cache voided");
				this.hueCache.clear();
			}

			const [calculationSuccess, calculationResponse] = this.calculateFractal(parameters);

			// Errored, so override the results
			if (!calculationSuccess) {
				this.clearCacheApplyDefaultColor(parameters.axisSize);
			} else {
				this.applyFractal(parameters);
			}

			if (viewAfterApplication) {
				clientStore.dispatch({ type: "changeViewingStatus", isViewed: true });
			}

			// Sends a notification after applying and viewing
			if (!calculationSuccess) {
				const errorMessage = this.handleCalculationError(calculationResponse);
				$warn("render of", parameters.fractalId, "fractal failed due to error:", errorMessage);

				return;
			}

			VERBOSE_DEBUG_MODE && $print("complete render of", parameters.fractalId, "fractal", endTimer(), "\n");
		});
	}

	private handleAxisSizeChange(oldAxisSize: number, newAxisSize: number) {
		$print("axis size changed");

		clientStore.dispatch({ type: "changeViewingStatus", isViewed: false });
		this.clearParts(oldAxisSize);

		this.constructParts(newAxisSize);
	}

	private constructParts(axisSize: number) {
		const endTimer = beginTimer();

		let createdCount = 0;

		for (const i of $range(0, axisSize - 1)) {
			const column = [];

			for (const j of $range(0, axisSize - 1)) {
				const part = new Instance("Part");
				part.Color = blackColor;
				part.Position = new Vector3(i, j, 0);
				part.Size = Vector3.one;
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

		const [success, response] = Promise.try(() => system(parameters, this.hueCache))
			.timeout(MAX_TIME_PER_CALCULATION_ENTIRETY)
			.await();

		if (success && VERBOSE_DEBUG_MODE) {
			$print("complete fractal calculation", endTimer());
		}

		return $tuple(success, response);
	}

	private clearCacheApplyDefaultColor(axisSize: number) {
		this.hueCache.clear();

		for (const i of $range(0, axisSize - 1)) {
			const partsColumn = this.partsGrid[i];

			for (const j of $range(0, axisSize - 1)) {
				partsColumn[j].Color = blackColor;
			}
		}
	}

	private applyFractal({ offsetX, offsetY, hueShift, axisSize }: FractalParameters) {
		const trueHueShift = hueShift / 360;
		const endTimer = beginTimer();

		for (const i of $range(0, axisSize - 1)) {
			const xPosition = i + offsetX;

			const cacheColumn = this.hueCache.get(xPosition)!;
			const partsColumn = this.partsGrid[i];

			for (const j of $range(0, axisSize - 1)) {
				const yPosition = j + offsetY;

				const hue = cacheColumn.get(yPosition)!;
				const color = this.getColorFromHue(hue, trueHueShift);

				partsColumn[j].Color = color;
			}
		}

		VERBOSE_DEBUG_MODE && $print("complete fractal application", endTimer());
	}

	private getColorFromHue(hue: number, trueHueShift: number) {
		if (hue === -1) return blackColor;
		if (hue === -2) return whiteColor;

		hue += trueHueShift;

		return Color3.fromHSV(hue > 1 ? hue % 1 : hue, 1, 1);
	}

	private handleCalculationError(response: unknown) {
		let errorMessage = "unknown error";

		// Promise error API won't work, this is a fix
		if (typeIs(response, "table")) {
			const tableResponse = response as {
				kind: Promise.Error.Kind;
				error: string;
			};

			if (tableResponse.kind === Promise.Error.Kind.TimedOut) {
				errorMessage = "fractal calculation timed out";
			}

			const foundMessage = string.match(tableResponse.error, ":%d+: (.-)$")[0] as string | undefined;

			if (foundMessage !== undefined) {
				errorMessage = foundMessage;
			}
		}

		const errorNotificationData = {
			text: `<font color="rgb(255, 51, 0)">error occurred:</font> ${errorMessage}`,
		} satisfies NotifcationData;

		clientStore.dispatch({ type: "sendNotification", data: errorNotificationData });
		return errorMessage;
	}
}
