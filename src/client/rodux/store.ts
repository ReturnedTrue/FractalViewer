import { Store, combineReducers } from "@rbxts/rodux";
import { PersistentDataActions, PersistentDataState, persistentDataReducer } from "./reducers/persistentData";
import { FractalActions, FractalState, fractalReducer } from "./reducers/fractal";

export interface CombinedState {
	persistentData: PersistentDataState;
	fractal: FractalState;
}

export type CombinedActions = PersistentDataActions | FractalActions;

const combinedReducers = combineReducers<CombinedState, CombinedActions>({
	persistentData: persistentDataReducer,
	fractal: fractalReducer,
});

export const clientStore = new Store(combinedReducers);

export function connectToStoreChange(connector: (newState: CombinedState, oldState: CombinedState) => void) {
	return clientStore.changed.connect((newState, oldState) => {
		task.spawn(connector, newState, oldState);
	});
}
