import { Action, createReducer } from "@rbxts/rodux";
import { DEFAULT_PLAYER_DATA } from "shared/constants/data";
import { PlayerData } from "shared/types/PlayerData";

interface SetPersistentData extends Action<"setPersistentData"> {
	data: PersistentDataState;
}

export type PersistentDataActions = SetPersistentData;
export type PersistentDataState = PlayerData;

export const persistentDataReducer = createReducer<PersistentDataState, PersistentDataActions>(DEFAULT_PLAYER_DATA, {
	setPersistentData: (_, { data }) => data,
});
