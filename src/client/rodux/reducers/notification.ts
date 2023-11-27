import { Action, createReducer } from "@rbxts/rodux";
import { NotifcationData } from "client/types/NotificationData";

interface SendNotification extends Action<"sendNotification"> {
	data: NotifcationData;
}

export type NotificationActions = SendNotification;
export interface NotificationState {
	notificationLastUpdated: number;
	notificationQueued: NotifcationData | undefined;
}

const DEFAULT_VALUE = {
	notificationLastUpdated: os.clock(),
	notificationQueued: undefined,
} satisfies NotificationState;

export const notificationReducer = createReducer<NotificationState, NotificationActions>(DEFAULT_VALUE, {
	sendNotification: (state, { data }) => {
		return {
			...state,
			notificationLastUpdated: os.clock(),
			notificationQueued: data,
		};
	},
});
