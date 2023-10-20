import { Controller, OnStart } from "@flamework/core";
import Roact from "@rbxts/roact";
import { Players, StarterGui } from "@rbxts/services";
import { App } from "client/roact/App";

const hiddenCoreGuis: Array<Enum.CoreGuiType> = [Enum.CoreGuiType.PlayerList];

@Controller()
export class GuiController implements OnStart {
	onStart() {
		for (const hidden of hiddenCoreGuis) {
			StarterGui.SetCoreGuiEnabled(hidden, false);
		}

		const playerGui = Players.LocalPlayer.WaitForChild("PlayerGui");
		const app = Roact.createElement(App);

		Roact.mount(app, playerGui);
	}
}
