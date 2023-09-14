import { Action, createReducer } from "@rbxts/rodux";
import { DEFAULT_PLAYER_DATA } from "shared/constants/data";
import { PlayerData } from "shared/types/PlayerData";

interface UpdatePersistentData extends Action<"updatePersistentData"> {
	newData: PlayerData;
}

export type PersistentDataActions = UpdatePersistentData;
export type PersistentDataState = PlayerData;

export const persistentDataReducer = createReducer<PersistentDataState, PersistentDataActions>(DEFAULT_PLAYER_DATA, {
	updatePersistentData: (_, { newData }) => newData,
});
