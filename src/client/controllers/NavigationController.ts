import { Controller, OnStart } from "@flamework/core";
import { UserInputService } from "@rbxts/services";
import { clientStore } from "client/rodux/store";
import { MAGNIFICATION_INCREMENT, WASD_MOVEMENT_INCREMENT } from "shared/constants/fractal";

@Controller()
export class NavigationController implements OnStart {
	onStart() {
		UserInputService.InputBegan.Connect((input) => {
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

				case Enum.KeyCode.O:
					newParameters.magnification += MAGNIFICATION_INCREMENT;
					break;

				case Enum.KeyCode.P:
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
		});
	}
}
