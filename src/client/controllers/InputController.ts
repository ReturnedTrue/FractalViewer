import { Controller, OnStart } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import { clientStore } from "client/rodux/store";
import {
	HELD_INPUT_SECONDS_INTERVAL,
	MAGNIFICATION_INCREMENT,
	WASD_MOVEMENT_INCREMENT,
} from "shared/constants/fractal";
import { InterfaceMode } from "shared/enums/InterfaceMode";
import { FractalParameterNameForType, FractalParameters } from "shared/types/FractalParameters";
import { NotifcationData } from "shared/types/NotificationData";

type ParameterEditingControlData = {
	edits: FractalParameterNameForType<number>;
	by: number;
	repeats?: boolean;
	validatedVia?: (newValue: number) => boolean;
};

type FunctionControlData = () => NotifcationData | void;

type InputControlData = ParameterEditingControlData | FunctionControlData;

const inputControls = new Map<Enum.KeyCode, InputControlData>([
	[Enum.KeyCode.D, { edits: "xOffset", by: WASD_MOVEMENT_INCREMENT, repeats: true }],

	[Enum.KeyCode.A, { edits: "xOffset", by: -WASD_MOVEMENT_INCREMENT, repeats: true }],

	[Enum.KeyCode.W, { edits: "yOffset", by: WASD_MOVEMENT_INCREMENT, repeats: true }],

	[Enum.KeyCode.S, { edits: "yOffset", by: -WASD_MOVEMENT_INCREMENT, repeats: true }],

	[Enum.KeyCode.E, { edits: "magnification", by: MAGNIFICATION_INCREMENT, repeats: true }],

	[
		Enum.KeyCode.Q,
		{ edits: "magnification", by: -MAGNIFICATION_INCREMENT, repeats: true, validatedVia: (value) => value > 0 },
	],

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
			const innerText = parametersResetWithFractalChange ? "no longer " : "";

			return {
				text: `Main parameters will ${innerText}reset on fractal change`,
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
	private controlThreads = new Map<Enum.KeyCode, thread>();

	onStart() {
		UserInputService.InputBegan.Connect((input, processed) => {
			if (processed) return;

			this.handleControl(input.KeyCode);
		});

		UserInputService.InputEnded.Connect((input, processed) => {
			if (processed) return;

			const ongoingControlThread = this.controlThreads.get(input.KeyCode);

			if (ongoingControlThread) {
				task.cancel(ongoingControlThread);
				this.controlThreads.delete(input.KeyCode);
			}
		});
	}

	private handleControl(keyCode: Enum.KeyCode) {
		const controlData = inputControls.get(keyCode);
		if (!controlData) return;

		const { interfaceMode, parameters } = clientStore.getState().fractal;
		if (interfaceMode === InterfaceMode.Hidden) return;

		if (typeIs(controlData, "function")) {
			this.runFunctionData(controlData);
			return;
		}

		this.runParameterEditingData(parameters, controlData);

		if (controlData.repeats && UserInputService.IsKeyDown(keyCode)) {
			const controlThread = task.spawn(() => {
				while (true) {
					task.wait(HELD_INPUT_SECONDS_INTERVAL);

					const { parameters: parametersNow } = clientStore.getState().fractal;
					this.runParameterEditingData(parametersNow, controlData);
				}
			});

			this.controlThreads.set(keyCode, controlThread);
		}
	}

	private runFunctionData(data: FunctionControlData) {
		const notificationData = data();

		if (notificationData) {
			clientStore.dispatch({ type: "sendNotification", data: notificationData });
		}
	}

	private runParameterEditingData(parameters: FractalParameters, data: ParameterEditingControlData) {
		const newValue = parameters[data.edits] + data.by;

		if (data.validatedVia && !data.validatedVia(newValue)) {
			return;
		}

		clientStore.dispatch({ type: "updateParameter", name: data.edits, value: newValue });
	}
}
