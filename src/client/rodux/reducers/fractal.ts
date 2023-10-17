import { Action, createReducer } from "@rbxts/rodux";
import { UserInputService } from "@rbxts/services";
import { $print, $warn } from "rbxts-transform-debug";
import { AXIS_SIZE, DEFAULT_FRACTAL_PARAMETERS, PARAMETERS_WHICH_RETAIN_CACHE } from "shared/constants/fractal";
import { FractalParameterName, FractalParameters } from "shared/types/FractalParameters";

interface SetPartsFolder extends Action<"setPartsFolder"> {
	partsFolder: Folder;
}

interface SetParameters extends Action<"setParameters"> {
	parameters: Partial<FractalParameters>;
}

interface UpdateParameter extends Action<"updateParameter"> {
	name: FractalParameterName;
	value: FractalParameters[this["name"]];
}

interface ResetParameters extends Action<"resetParameters"> {}

export type FractalActions = SetPartsFolder | SetParameters | UpdateParameter | ResetParameters;
export interface FractalState {
	parametersLastUpdated: number;
	parameters: FractalParameters;

	hasCacheBeenVoided: boolean;
	partsFolder: Folder | undefined;
}

const DEFAULT_VALUE = {
	parametersLastUpdated: os.clock(),
	parameters: DEFAULT_FRACTAL_PARAMETERS,

	hasCacheBeenVoided: false,
	partsFolder: undefined,
} satisfies FractalState;

type ParameterSideEffects = {
	[key in FractalParameterName]?: (
		value: FractalParameters[key],
		state: FractalState,
	) => Partial<FractalParameters> | undefined;
};

const parameterSideEffects: ParameterSideEffects = {
	magnification: (newMagnification, { parameters }) => {
		const [pivotX, pivotY] = parameters.pivot;
		if (pivotX === 0 && pivotY === 0) return;

		$print("Magnification side effect invoked");

		return {
			xOffset: pivotX * newMagnification - AXIS_SIZE / 2,
			yOffset: pivotY * newMagnification - AXIS_SIZE / 2,
		};
	},

	pivot: (newPivot, { parameters }) => {
		const [pivotX, pivotY] = newPivot;
		if (pivotX === 0 && pivotY === 0) return;

		const { magnification } = parameters;

		$print("Pivot set to", pivotX, pivotY);

		return {
			xOffset: pivotX * magnification - AXIS_SIZE / 2,
			yOffset: pivotY * magnification - AXIS_SIZE / 2,
		};
	},
};

export const fractalReducer = createReducer<FractalState, FractalActions>(DEFAULT_VALUE, {
	setPartsFolder: (state, { partsFolder }) => {
		return { ...state, partsFolder, parametersLastUpdated: os.clock() };
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
		const sideEffect = parameterSideEffects[name]?.(value as never, state);

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
			},
			hasCacheBeenVoided: true,
		};
	},
});
