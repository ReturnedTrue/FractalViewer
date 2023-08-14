import { Controller, OnStart } from "@flamework/core";
import { ContextActionService, UserInputService } from "@rbxts/services";
import { clientStore } from "client/rodux/store";
import { MAGNIFICATION_INCREMENT, WASD_MOVEMENT_INCREMENT } from "shared/constants/fractal";

@Controller()
export class NavigationController implements OnStart {
	onStart() {
		UserInputService.InputBegan.Connect((input, processed) => {
			if (processed) return;

			this.handleNextInput(input);
		});
	}

	private handleNextInput(input: InputObject) {
		const newParameters = {
			...clientStore.getState().fractal.parameters,
		};

		switch (input.KeyCode) {
			case Enum.KeyCode.A:
				newParameters.xOffset -= WASD_MOVEMENT_INCREMENT;
				break;

			case Enum.KeyCode.D:
				newParameters.xOffset += WASD_MOVEMENT_INCREMENT;
				break;

			case Enum.KeyCode.W:
				newParameters.yOffset += WASD_MOVEMENT_INCREMENT;
				break;

			case Enum.KeyCode.S:
				newParameters.yOffset -= WASD_MOVEMENT_INCREMENT;
				break;

			case Enum.KeyCode.E:
				newParameters.magnification += MAGNIFICATION_INCREMENT;
				break;

			case Enum.KeyCode.Q:
				newParameters.magnification = math.max(newParameters.magnification - MAGNIFICATION_INCREMENT, 1);
				break;

			case Enum.KeyCode.R:
				newParameters.xOffset = 0;
				newParameters.yOffset = 0;
				newParameters.magnification = 1;
				break;

			default:
				return;
		}

		clientStore.dispatch({ type: "updateParameters", parameters: newParameters });
	}
}
