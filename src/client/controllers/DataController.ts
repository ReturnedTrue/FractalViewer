import { Controller, OnStart } from "@flamework/core";
import { Events, Functions } from "client/remotes";
import { clientStore } from "client/rodux/store";
import { $warn } from "rbxts-transform-debug";
import { PlayerData } from "shared/types/PlayerData";

@Controller()
export class DataController implements OnStart {
	private isFirstData = true;

	onStart() {
		Functions.getData
			.invoke()
			.then((data) => data && this.dataReceieved(data))
			.catch((err) => $warn("initial data retrieval failed due to:", err));

		Events.dataUpdated.connect((data) => this.dataReceieved(data));
	}

	public dataReceieved(data: PlayerData) {
		clientStore.dispatch({ type: "setPersistentData", data: data });

		if (this.isFirstData) {
			this.isFirstData = false;

			clientStore.dispatch({ type: "setParameters", parameters: data.savedParameters });
		}
	}
}
