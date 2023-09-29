import { Action, createReducer } from "@rbxts/rodux";
import { AXIS_SIZE, DEFAULT_FRACTAL_PARAMETERS, PARAMETERS_WHICH_VOID_CACHE } from "shared/constants/fractal";
import { FractalParameterName, FractalParameters } from "shared/types/FractalParameters";

interface SetPartsFolder extends Action<"setPartsFolder"> {
	partsFolder: Folder;
}

interface SetPivot extends Action<"setPivot"> {
	pivot: Vector3;
}

interface SetParameters extends Action<"setParameters"> {
	parameters: Partial<FractalParameters>;
}

interface UpdateParameter extends Action<"updateParameter"> {
	name: FractalParameterName;
	value: FractalParameters[this["name"]];
}

interface ResetParameters extends Action<"resetParameters"> {}

export type FractalActions = SetPartsFolder | SetPivot | SetParameters | UpdateParameter | ResetParameters;
export interface FractalState {
	parametersLastUpdated: number;
	parameters: FractalParameters;

	hasCacheBeenVoided: boolean;
	partsFolder: Folder | undefined;

	pivot: Vector3;
}

const DEFAULT_VALUE = {
	parametersLastUpdated: os.clock(),
	parameters: DEFAULT_FRACTAL_PARAMETERS,

	hasCacheBeenVoided: false,
	partsFolder: undefined,

	pivot: Vector3.zero,
} satisfies FractalState;

type ParameterSideEffects = {
	[key in FractalParameterName]?: (value: FractalParameters[key], state: FractalState) => Partial<FractalParameters>;
};

const parameterSideEffects: ParameterSideEffects = {
	magnification: (newMagnification, { pivot }) => {
		print("side effect invoked");
		return {
			xOffset: pivot.X * newMagnification - AXIS_SIZE / 2,
			yOffset: pivot.Y * newMagnification - AXIS_SIZE / 2,
		};
	},
};

export const fractalReducer = createReducer<FractalState, FractalActions>(DEFAULT_VALUE, {
	setPartsFolder: (state, { partsFolder }) => {
		return { ...state, partsFolder };
	},

	setPivot: (state, { pivot }) => {
		return { ...state, pivot };
	},

	setParameters: (state, { parameters }) => {
		return {
			...state,
			parametersLastUpdated: os.clock(),
			parameters: {
				...state.parameters,
				parameters,
			},

			hasCacheBeenVoided: true,
		};
	},

	updateParameter: (state, { name, value }) => {
		const hasCacheBeenVoided = !PARAMETERS_WHICH_VOID_CACHE.has(name);
		const sideEffect = parameterSideEffects[name]?.(value as never, state);

		return {
			...state,
			parametersLastUpdated: os.clock(),
			parameters: {
				...state.parameters,
				...sideEffect,
				[name]: value,
			},

			hasCacheBeenVoided,
		};
	},

	resetParameters: (state) => {
		return {
			...state,
			parametersLastUpdated: os.clock(),
			parameters: DEFAULT_VALUE.parameters,
			hasCacheBeenVoided: true,
		};
	},
});
