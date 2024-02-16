import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, ReplicatedStorage, UserInputService } from "@rbxts/services";
import { clientStore } from "client/rodux/store";
import {
	HELD_INPUT_SECONDS_INTERVAL,
	MAGNIFICATION_INCREMENT,
	WASD_MOVEMENT_INCREMENT,
} from "shared/constants/fractal";
import { InterfaceMode } from "client/enums/InterfaceMode";
import { FractalParameterNameForType, FractalParameters } from "shared/types/FractalParameters";
import { NotifcationData } from "client/types/NotificationData";
import { FractalId } from "shared/enums/FractalId";

const playerMovementActions = [
	"moveForwardAction",
	"moveBackwardAction",
	"moveLeftAction",
	"moveRightAction",
	"jumpAction",
];

type ParameterEditingControlData = {
	edits: FractalParameterNameForType<number>;
	by: number;
	repeats?: boolean;
	validatedVia?: (newValue: number) => boolean;
};

type FunctionControlData = () => NotifcationData | void;

type InputControlData = ParameterEditingControlData | FunctionControlData;

const inputControls = new Map<Enum.KeyCode, InputControlData>([
	[Enum.KeyCode.D, { edits: "offsetX", by: WASD_MOVEMENT_INCREMENT, repeats: true }],
	[Enum.KeyCode.A, { edits: "offsetX", by: -WASD_MOVEMENT_INCREMENT, repeats: true }],
	[Enum.KeyCode.W, { edits: "offsetY", by: WASD_MOVEMENT_INCREMENT, repeats: true }],
	[Enum.KeyCode.S, { edits: "offsetY", by: -WASD_MOVEMENT_INCREMENT, repeats: true }],
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
				text: "fractal parameters were reset",
			};
		},
	],

	[
		Enum.KeyCode.J,
		() => {
			const { parameters } = clientStore.getState().fractal;
			if (parameters.fractalId !== FractalId.Julia) return;

			const correspondingSet = parameters.juliaCorrespondingSet;
			clientStore.dispatch({ type: "updateParameter", name: "fractalId", value: correspondingSet });
		},
	],

	[
		Enum.KeyCode.T,
		() => {
			clientStore.dispatch({ type: "toggleResetOnFractalChange" });

			const { parametersResetOnIdChange } = clientStore.getState().fractal;
			const innerText = parametersResetOnIdChange ? "now" : "no longer";

			return {
				text: `parameters will ${innerText} reset on fractal change`,
			};
		},
	],

	[
		Enum.KeyCode.F,
		() => {
			clientStore.dispatch({ type: "toggleFullPictureMode" });

			const { interfaceMode } = clientStore.getState().fractal;
			const innerText = interfaceMode === InterfaceMode.FullPicture ? "entered" : "left";

			return {
				text: `${innerText} full picture mode`,
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
			if (!ongoingControlThread) return;

			task.cancel(ongoingControlThread);
			this.controlThreads.delete(input.KeyCode);
		});

		for (const action of playerMovementActions) {
			do {
				task.wait();
			} while (!(action in ContextActionService.GetAllBoundActionInfo()));

			ContextActionService.UnbindAction(action);
		}
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
			this.connectControlThread(keyCode, controlData);
		}
	}

	private runFunctionData(data: FunctionControlData) {
		const notificationData = data();

		if (notificationData) {
			clientStore.dispatch({ type: "sendNotification", data: notificationData });
		}
	}

	private connectControlThread(keyCode: Enum.KeyCode, controlData: ParameterEditingControlData) {
		const controlThread = task.spawn(() => {
			while (true) {
				task.wait(HELD_INPUT_SECONDS_INTERVAL);

				const parametersNow = clientStore.getState().fractal.parameters;
				this.runParameterEditingData(parametersNow, controlData);
			}
		});

		this.controlThreads.set(keyCode, controlThread);
	}

	private runParameterEditingData(parameters: FractalParameters, data: ParameterEditingControlData) {
		const newValue = parameters[data.edits] + data.by;

		if (data.validatedVia && !data.validatedVia(newValue)) {
			return;
		}

		clientStore.dispatch({ type: "updateParameter", name: data.edits, value: newValue });
	}
}
