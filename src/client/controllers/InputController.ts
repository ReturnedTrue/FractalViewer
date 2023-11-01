import { Controller, OnStart } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import { clientStore } from "client/rodux/store";
import { MAGNIFICATION_INCREMENT, WASD_MOVEMENT_INCREMENT } from "shared/constants/fractal";
import { InterfaceMode } from "shared/enums/InterfaceMode";
import { FractalParameterNameForType } from "shared/types/FractalParameters";
import { NotifcationData } from "shared/types/NotificationData";

type InputControlData = { edits: FractalParameterNameForType<number>; by: number } | (() => NotifcationData | void);

const inputControls = new Map<Enum.KeyCode, InputControlData>([
	[Enum.KeyCode.D, { edits: "xOffset", by: WASD_MOVEMENT_INCREMENT }],

	[Enum.KeyCode.A, { edits: "xOffset", by: -WASD_MOVEMENT_INCREMENT }],

	[Enum.KeyCode.W, { edits: "yOffset", by: WASD_MOVEMENT_INCREMENT }],

	[Enum.KeyCode.S, { edits: "yOffset", by: -WASD_MOVEMENT_INCREMENT }],

	[Enum.KeyCode.E, { edits: "magnification", by: MAGNIFICATION_INCREMENT }],

	[Enum.KeyCode.Q, { edits: "magnification", by: -MAGNIFICATION_INCREMENT }],

	[
		Enum.KeyCode.R,
		() => {
			clientStore.dispatch({ type: "resetParameters" });

			return {
				text: "Fractal parameters were reset",
			};
		},
	],

	[
		Enum.KeyCode.T,
		() => {
			clientStore.dispatch({ type: "toggleResetOnFractalChange" });

			const { parametersResetWithFractalChange } = clientStore.getState().fractal;

			return {
				text: `Main parameters will ${
					parametersResetWithFractalChange ? "no longer" : ""
				} reset on fractal change`,
			};
		},
	],

	[
		Enum.KeyCode.F,
		() => {
			clientStore.dispatch({ type: "toggleFullPictureMode" });

			const { interfaceMode } = clientStore.getState().fractal;

			return {
				text: `${interfaceMode === InterfaceMode.FullPicture ? "Entered" : "Left"} full picture mode`,
			};
		},
	],
]);

@Controller()
export class InputController implements OnStart {
	onStart() {
		UserInputService.InputBegan.Connect((input, processed) => {
			if (processed) return;

			this.handleNextInput(input);
		});
	}

	private handleNextInput(input: InputObject) {
		const controlData = inputControls.get(input.KeyCode);
		if (!controlData) return;

		const { partsFolder, parameters } = clientStore.getState().fractal;
		if (!partsFolder) return;

		if (typeIs(controlData, "function")) {
			const notificationData = controlData();

			if (notificationData) {
				clientStore.dispatch({ type: "sendNotification", data: notificationData });
			}

			return;
		}

		const newValue = parameters[controlData.edits] + controlData.by;

		clientStore.dispatch({ type: "updateParameter", name: controlData.edits, value: newValue });
	}
}
