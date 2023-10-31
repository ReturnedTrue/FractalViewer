import { Store, combineReducers } from "@rbxts/rodux";
import { PersistentDataActions, PersistentDataState, persistentDataReducer } from "./reducers/persistentData";
import { FractalActions, FractalState, fractalReducer } from "./reducers/fractal";
import { NotificationActions, NotificationState, notificationReducer } from "./reducers/notification";

export interface CombinedState {
	persistentData: PersistentDataState;
	fractal: FractalState;
	notification: NotificationState;
}

export type CombinedActions = PersistentDataActions | FractalActions | NotificationActions;

const combinedReducers = combineReducers<CombinedState, CombinedActions>({
	persistentData: persistentDataReducer,
	fractal: fractalReducer,
	notification: notificationReducer,
});

export const clientStore = new Store(combinedReducers);

export function connectToStoreChange(connector: (newState: CombinedState, oldState: CombinedState) => void) {
	return clientStore.changed.connect((newState, oldState) => {
		task.spawn(connector, newState, oldState);
	});
}
