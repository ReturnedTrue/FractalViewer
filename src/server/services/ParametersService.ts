import { OnStart, Service } from "@flamework/core";
import { Functions } from "server/remotes";
import { FractalParameters } from "shared/types/FractalParameters";
import { PlayerDataService } from "./PlayerDataService";

@Service()
export class ParametersService implements OnStart {
	constructor(private playerDataService: PlayerDataService) {}

	onStart() {
		Functions.saveParameters.setCallback((...args) => this.saveParameters(...args));
	}

	private saveParameters(player: Player, parameters: FractalParameters) {
		return this.playerDataService.updatePlayerData(player, (data) => {
			return {
				...data,
				savedParameters: parameters,
			};
		});
	}
}
