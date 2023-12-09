import { PlayerData } from "shared/types/PlayerData";
import { DEFAULT_FRACTAL_PARAMETERS } from "./fractal";
import { RunService } from "@rbxts/services";

export const DEFAULT_PLAYER_DATA = {
	savedParameters: DEFAULT_FRACTAL_PARAMETERS,
} satisfies PlayerData;

export const PROFILE_STORE_NAME = "PlayerData";
export const PROFILE_KEY_FORMAT = "Data_%d";

const RESET_DATA = true;
export const RESET_PROFILE_DATA = RunService.IsStudio() && RESET_DATA;
