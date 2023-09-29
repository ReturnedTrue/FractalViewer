import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, UserInputService } from "@rbxts/services";
import { FractalState } from "client/rodux/reducers/fractal";
import { clientStore } from "client/rodux/store";
import { AXIS_SIZE, MAGNIFICATION_INCREMENT, WASD_MOVEMENT_INCREMENT } from "shared/constants/fractal";
import { FractalParameterName, FractalParameters } from "shared/types/FractalParameters";

type NavigationControlFunction = {
	[key in FractalParameterName]: (
		state: Readonly<FractalState>,
	) => { name: key; value: FractalParameters[key] } | false;
}[FractalParameterName];

const navigationControls = new Map<Enum.KeyCode, NavigationControlFunction>([
	[
		Enum.KeyCode.D,
		({ parameters }) => {
			return { name: "xOffset", value: parameters.xOffset + WASD_MOVEMENT_INCREMENT };
		},
	],

	[
		Enum.KeyCode.A,
		({ parameters }) => {
			return { name: "xOffset", value: parameters.xOffset - WASD_MOVEMENT_INCREMENT };
		},
	],

	[
		Enum.KeyCode.W,
		({ parameters }) => {
			return { name: "yOffset", value: parameters.yOffset + WASD_MOVEMENT_INCREMENT };
		},
	],

	[
		Enum.KeyCode.S,
		({ parameters }) => {
			return { name: "yOffset", value: parameters.yOffset - WASD_MOVEMENT_INCREMENT };
		},
	],

	[
		Enum.KeyCode.E,
		({ parameters }) => {
			return { name: "magnification", value: parameters.magnification + MAGNIFICATION_INCREMENT };
		},
	],

	[
		Enum.KeyCode.R,
		() => {
			clientStore.dispatch({ type: "resetParameters" });
			return false;
		},
	],
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
		const registeredFunction = navigationControls.get(input.KeyCode);
		if (!registeredFunction) return;

		const { fractal } = clientStore.getState();

		const updatedParameter = registeredFunction(fractal);
		if (!updatedParameter) return;

		clientStore.dispatch({ type: "updateParameter", ...updatedParameter });
	}
}
