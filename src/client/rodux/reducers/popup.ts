import { Element } from "@rbxts/roact";
import { Action, createReducer } from "@rbxts/rodux";

interface SendPopup extends Action<"sendPopup"> {
	element: Element;
}

interface ClosePopup extends Action<"closePopup"> {}

export type PopupActions = SendPopup | ClosePopup;
export interface PopupState {
	displayedElement: Element | false;
}

const DEFAULT_VALUE = {
	displayedElement: false,
} satisfies PopupState;

export const popupReducer = createReducer<PopupState, PopupActions>(DEFAULT_VALUE, {
	sendPopup: (state, action) => {
		return {
			...state,
			displayedElement: action.element,
		};
	},

	closePopup: (state) => {
		return {
			...state,
			displayedElement: false,
		};
	},
});
