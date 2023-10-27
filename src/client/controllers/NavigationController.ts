import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, UserInputService } from "@rbxts/services";
import { FractalState } from "client/rodux/reducers/fractal";
import { clientStore } from "client/rodux/store";
import { MAGNIFICATION_INCREMENT, WASD_MOVEMENT_INCREMENT } from "shared/constants/fractal";
import { FractalParameterName, FractalParameterNameForType, FractalParameters } from "shared/types/FractalParameters";

type NavigationControlData = { edits: FractalParameterNameForType<number>; by: number } | (() => void);

const navigationControls = new Map<Enum.KeyCode, NavigationControlData>([
	[Enum.KeyCode.D, { edits: "xOffset", by: WASD_MOVEMENT_INCREMENT }],

	[Enum.KeyCode.A, { edits: "xOffset", by: -WASD_MOVEMENT_INCREMENT }],

	[Enum.KeyCode.W, { edits: "yOffset", by: WASD_MOVEMENT_INCREMENT }],

	[Enum.KeyCode.S, { edits: "yOffset", by: -WASD_MOVEMENT_INCREMENT }],

	[Enum.KeyCode.E, { edits: "magnification", by: MAGNIFICATION_INCREMENT }],

	[Enum.KeyCode.Q, { edits: "magnification", by: -MAGNIFICATION_INCREMENT }],

	[Enum.KeyCode.R, () => clientStore.dispatch({ type: "resetParameters" })],
	[Enum.KeyCode.F, () => clientStore.dispatch({ type: "toggleFullPictureMode" })],
]);

@Controller()
export class NavigationController implements OnStart {
	onStart() {
		UserInputService.InputBegan.Connect((input, processed) => {
			if (processed) return;

			this.handleNextInput(input);
		});
	}

	private handleNextInput(input: InputObject) {
		const controlData = navigationControls.get(input.KeyCode);
		if (!controlData) return;

		if (typeIs(controlData, "function")) {
			controlData();
			return;
		}

		const { parameters } = clientStore.getState().fractal;
		const newValue = parameters[controlData.edits] + controlData.by;

		clientStore.dispatch({ type: "updateParameter", name: controlData.edits, value: newValue });
	}
}
