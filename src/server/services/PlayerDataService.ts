import ProfileService from "@rbxts/profileservice";
import { OnStart, Service } from "@flamework/core";
import { Players, RunService } from "@rbxts/services";
import {
	DEFAULT_PLAYER_DATA,
	PROFILE_KEY_FORMAT,
	PROFILE_STORE_NAME,
	RESET_DATA_IN_STUDIO,
} from "shared/constants/data";
import { Profile } from "@rbxts/profileservice/globals";
import { PlayerData } from "shared/types/PlayerData";
import { Events, Functions } from "server/remotes";
import { $print } from "rbxts-transform-debug";

@Service()
export class PlayerDataService implements OnStart {
	private profileStore = ProfileService.GetProfileStore(PROFILE_STORE_NAME, DEFAULT_PLAYER_DATA);
	private profiles = new Map<Player, Profile<PlayerData>>();

	onStart() {
		for (const player of Players.GetPlayers()) {
			task.spawn(() => this.loadPlayerProfile(player));
		}

		Players.PlayerAdded.Connect((player) => this.loadPlayerProfile(player));
		Players.PlayerRemoving.Connect((player) => this.releasePlayerProfile(player));

		Functions.getData.setCallback((player) => this.getPlayerData(player));
	}

	public getPlayerData(player: Player): Readonly<PlayerData> | false {
		return this.profiles.get(player)?.Data ?? false;
	}

	public updatePlayerData(player: Player, callback: (data: Readonly<PlayerData>) => PlayerData): boolean {
		const profile = this.profiles.get(player);
		if (!profile) return false;

		const newData = callback(profile.Data);
		profile.Data = newData;

		Events.dataUpdated.fire(player, newData);

		$print("successfully updated player", player.Name, "data to:", profile.Data);

		return true;
	}

	private loadPlayerProfile(player: Player) {
		const key = PROFILE_KEY_FORMAT.format(player.UserId);
		const profile = this.profileStore.LoadProfileAsync(key, "ForceLoad");

		if (!profile) {
			player.Kick("failed to load player data");
			return;
		}

		profile.AddUserId(player.UserId);

		if (RESET_DATA_IN_STUDIO && RunService.IsStudio()) {
			profile.Data = DEFAULT_PLAYER_DATA;
			//
		} else {
			profile.Reconcile();
		}

		this.profiles.set(player, profile);

		Events.dataUpdated.fire(player, profile.Data);

		$print("successfully loaded player", player.Name, "profile with data:", profile.Data);
	}

	private releasePlayerProfile(player: Player) {
		const profile = this.profiles.get(player);
		if (!profile) return;

		profile.Release();

		this.profiles.delete(player);
	}
}
