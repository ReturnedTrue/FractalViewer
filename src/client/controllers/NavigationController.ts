import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, UserInputService } from "@rbxts/services";
import { clientStore } from "client/rodux/store";
import { AXIS_SIZE, MAGNIFICATION_INCREMENT, WASD_MOVEMENT_INCREMENT } from "shared/constants/fractal";
import { FractalParameters } from "shared/types/FractalParameters";

@Controller()
export class NavigationController implements OnStart {
	onStart() {
		UserInputService.InputBegan.Connect((input, processed) => {
			if (processed) return;

			this.handleNextInput(input);
		});
	}

	private handleNextInput(input: InputObject) {
		const { fractal } = clientStore.getState();
		const { pivot, parameters: oldParameters } = fractal;

		const newParameters: Partial<FractalParameters> = {};

		switch (input.KeyCode) {
			case Enum.KeyCode.D:
				newParameters.xOffset = oldParameters.xOffset + WASD_MOVEMENT_INCREMENT;
				break;

			case Enum.KeyCode.A:
				newParameters.xOffset = oldParameters.xOffset - WASD_MOVEMENT_INCREMENT;
				break;

			case Enum.KeyCode.W:
				newParameters.yOffset = oldParameters.yOffset + WASD_MOVEMENT_INCREMENT;
				break;

			case Enum.KeyCode.S:
				newParameters.yOffset = oldParameters.yOffset - WASD_MOVEMENT_INCREMENT;
				break;

			case Enum.KeyCode.E:
				newParameters.magnification = oldParameters.magnification + MAGNIFICATION_INCREMENT;
				newParameters.xOffset = pivot.X * newParameters.magnification - pivot.X;
				newParameters.yOffset = pivot.Y * newParameters.magnification - pivot.Y;

				break;

			case Enum.KeyCode.Q:
				newParameters.magnification = math.max(oldParameters.magnification - MAGNIFICATION_INCREMENT, 1);
				newParameters.xOffset = pivot.X * newParameters.magnification - pivot.X;
				newParameters.yOffset = pivot.Y * newParameters.magnification - pivot.Y;
				break;

			case Enum.KeyCode.R:
				clientStore.dispatch({ type: "resetParameters" });
				return;

			default:
				return;
		}

		clientStore.dispatch({ type: "updateParameters", parameters: newParameters });
	}
}
