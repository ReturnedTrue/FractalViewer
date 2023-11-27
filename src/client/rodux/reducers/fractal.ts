import { Action, createReducer } from "@rbxts/rodux";
import { DEFAULT_FRACTAL_PARAMETERS, PARAMETERS_WHICH_RETAIN_CACHE } from "shared/constants/fractal";
import { InterfaceMode } from "shared/enums/InterfaceMode";
import { FractalParameterName, FractalParameters } from "shared/types/FractalParameters";

interface SetPartsFolder extends Action<"setPartsFolder"> {
	partsFolder: Folder;
}

interface ChangeViewingStatus extends Action<"changeViewingStatus"> {
	isViewed: boolean;
}

interface RequestRender extends Action<"requestRender"> {}

interface ToggleFullPictureMode extends Action<"toggleFullPictureMode"> {}

interface ToggleResetOnFractalChange extends Action<"toggleResetOnFractalChange"> {}

interface SetParameters extends Action<"setParameters"> {
	parameters: Partial<FractalParameters>;
}

interface UpdateParameter extends Action<"updateParameter"> {
	name: FractalParameterName;
	value: FractalParameters[this["name"]];
}

interface ResetParameters extends Action<"resetParameters"> {}

export type FractalActions =
	| SetPartsFolder
	| ChangeViewingStatus
	| RequestRender
	| ToggleFullPictureMode
	| ToggleResetOnFractalChange
	| SetParameters
	| UpdateParameter
	| ResetParameters;

export interface FractalState {
	parametersResetWithFractalChange: boolean;
	parametersLastUpdated: number | false;
	parameters: FractalParameters;

	hasCacheBeenVoided: boolean;
	partsFolder: Folder | false;

	interfaceMode: InterfaceMode;
}

const DEFAULT_VALUE = {
	parametersResetWithFractalChange: false,
	parametersLastUpdated: false,
	parameters: DEFAULT_FRACTAL_PARAMETERS,

	hasCacheBeenVoided: false,
	partsFolder: false,

	interfaceMode: InterfaceMode.Hidden,
} satisfies FractalState;

type ParameterSideEffects = {
	[key in FractalParameterName]?: (
		value: FractalParameters[key],
		oldValue: FractalParameters[key],
		state: FractalState,
	) => Partial<FractalParameters> | undefined;
};

const parameterSideEffects: ParameterSideEffects = {
	magnification: (newMagnification, oldMagnification, { parameters }) => {
		if (parameters.pivot === false) return;

		const [pivotX, pivotY] = parameters.pivot;
		const newPivotX = math.round((pivotX / oldMagnification) * newMagnification);
		const newPivotY = math.round((pivotY / oldMagnification) * newMagnification);

		return {
			pivot: [newPivotX, newPivotY],
			offsetX: newPivotX - parameters.axisSize / 2,
			offsetY: newPivotY - parameters.axisSize / 2,
		};
	},

	pivot: (newPivot, _oldPivot, { parameters }) => {
		if (newPivot === false) return;

		const [pivotX, pivotY] = newPivot;

		return {
			offsetX: pivotX - parameters.axisSize / 2,
			offsetY: pivotY - parameters.axisSize / 2,
		};
	},

	fractalId: (_newFractal, _oldFractal, { parametersResetWithFractalChange }) => {
		if (!parametersResetWithFractalChange) return;

		return {
			offsetX: 0,
			offsetY: 0,
			magnification: 1,
			pivot: false,
		};
	},
};

export const fractalReducer = createReducer<FractalState, FractalActions>(DEFAULT_VALUE, {
	setPartsFolder: (state, { partsFolder }) => {
		return {
			...state,
			partsFolder,
		};
	},

	changeViewingStatus: (state, { isViewed }) => {
		return {
			...state,
			interfaceMode: isViewed ? InterfaceMode.Shown : InterfaceMode.Hidden,
		};
	},

	requestRender: (state) => {
		return {
			...state,
			parametersLastUpdated: os.clock(),
		};
	},

	toggleFullPictureMode: (state) => {
		if (state.interfaceMode === InterfaceMode.Hidden) return state;

		return {
			...state,
			interfaceMode:
				state.interfaceMode !== InterfaceMode.FullPicture ? InterfaceMode.FullPicture : InterfaceMode.Shown,
		};
	},

	toggleResetOnFractalChange: (state) => {
		return {
			...state,
			parametersResetWithFractalChange: !state.parametersResetWithFractalChange,
		};
	},

	setParameters: (state, { parameters }) => {
		return {
			...state,
			parametersLastUpdated: os.clock(),
			parameters: {
				...state.parameters,
				...parameters,
			},

			hasCacheBeenVoided: true,
		};
	},

	updateParameter: (state, { name, value }) => {
		const hasCacheBeenVoided = !PARAMETERS_WHICH_RETAIN_CACHE.has(name);
		const sideEffect = parameterSideEffects[name]?.(value as never, state.parameters[name] as never, state);

		return {
			...state,
			parametersLastUpdated: os.clock(),
			parameters: {
				...state.parameters,
				[name]: value,
				...sideEffect,
			},

			hasCacheBeenVoided,
		};
	},

	resetParameters: (state) => {
		return {
			...state,
			parametersLastUpdated: os.clock(),
			parameters: {
				...DEFAULT_FRACTAL_PARAMETERS,
				fractalId: state.parameters.fractalId,
				axisSize: state.parameters.axisSize,
			},
			hasCacheBeenVoided: true,
		};
	},
});
