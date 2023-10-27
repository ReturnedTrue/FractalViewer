import { Action, createReducer } from "@rbxts/rodux";
import { DEFAULT_FRACTAL_PARAMETERS, PARAMETERS_WHICH_RETAIN_CACHE } from "shared/constants/fractal";
import { InterfaceMode } from "shared/enums/InterfaceMode";
import { FractalParameterName, FractalParameters } from "shared/types/FractalParameters";

interface SetPartsFolder extends Action<"setPartsFolder"> {
	partsFolder: Folder | undefined;
}

interface ToggleFullPictureMode extends Action<"toggleFullPictureMode"> {}

interface SetParameters extends Action<"setParameters"> {
	parameters: Partial<FractalParameters>;
}

interface UpdateParameter extends Action<"updateParameter"> {
	name: FractalParameterName;
	value: FractalParameters[this["name"]];
}

interface ResetParameters extends Action<"resetParameters"> {}

export type FractalActions = SetPartsFolder | ToggleFullPictureMode | SetParameters | UpdateParameter | ResetParameters;
export interface FractalState {
	parametersLastUpdated: number;
	parameters: FractalParameters;

	hasCacheBeenVoided: boolean;
	partsFolder: Folder | undefined;

	interfaceMode: InterfaceMode;
}

const DEFAULT_VALUE = {
	parametersLastUpdated: os.clock(),
	parameters: DEFAULT_FRACTAL_PARAMETERS,

	hasCacheBeenVoided: false,
	partsFolder: undefined,

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
			xOffset: newPivotX - parameters.axisSize / 2,
			yOffset: newPivotY - parameters.axisSize / 2,
		};
	},

	pivot: (newPivot, _oldPivot, { parameters }) => {
		if (newPivot === false) return;

		const [pivotX, pivotY] = newPivot;

		return {
			xOffset: pivotX - parameters.axisSize / 2,
			yOffset: pivotY - parameters.axisSize / 2,
		};
	},

	// TODO create a setting to make changing the fractal reset the primary parameters
	/*
	fractalId: () => {
		return {
			xOffset: 0,
			yOffset: 0,
			magnification: 1,
			pivot: false,
		};
	},
	*/
};

export const fractalReducer = createReducer<FractalState, FractalActions>(DEFAULT_VALUE, {
	setPartsFolder: (state, { partsFolder }) => {
		return {
			...state,
			partsFolder,
			interfaceMode: partsFolder !== undefined ? InterfaceMode.Shown : InterfaceMode.Hidden,
			parametersLastUpdated: os.clock(),
		};
	},

	toggleFullPictureMode: (state) => {
		if (state.partsFolder === undefined) return state;

		return {
			...state,
			interfaceMode:
				state.interfaceMode !== InterfaceMode.FullPicture ? InterfaceMode.FullPicture : InterfaceMode.Shown,
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
