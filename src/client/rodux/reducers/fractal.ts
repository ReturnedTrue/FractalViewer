import { Action, createReducer } from "@rbxts/rodux";
import { DEFAULT_FRACTAL_PARAMETERS, PARAMETERS_WHICH_VOID_CACHE } from "shared/constants/fractal";
import { FractalParameterName, FractalParameters } from "shared/types/FractalParameters";

interface SetPartsFolder extends Action<"setPartsFolder"> {
	partsFolder: Folder;
}

interface UpdateParameters extends Action<"updateParameters"> {
	parameters: Partial<FractalParameters>;
}

interface UpdateSingleParameter extends Action<"updateSingleParameter"> {
	name: FractalParameterName;
	value: FractalParameters[this["name"]];
}

interface ResetParameters extends Action<"resetParameters"> {}

export type FractalActions = SetPartsFolder | UpdateParameters | UpdateSingleParameter | ResetParameters;
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

export const fractalReducer = createReducer<FractalState, FractalActions>(DEFAULT_VALUE, {
	setPartsFolder: (state, { partsFolder }) => {
		return { ...state, partsFolder };
	},

	updateParameters: (state, { parameters: newParameters }) => {
		let hasCacheBeenVoided = false;

		for (const [parameterName, parameterValue] of pairs(newParameters)) {
			const canVoid = !PARAMETERS_WHICH_VOID_CACHE.has(parameterName);
			const hasChanged = state.parameters[parameterName] !== parameterValue;

			if (canVoid && hasChanged) {
				hasCacheBeenVoided = true;
				break;
			}
		}

		return {
			...state,
			parametersLastUpdated: os.clock(),
			parameters: {
				...state.parameters,
				...newParameters,
			},

			hasCacheBeenVoided,
		};
	},

	updateSingleParameter: (state, { name, value }) => {
		const hasCacheBeenVoided = !PARAMETERS_WHICH_VOID_CACHE.has(name);

		return {
			...state,
			parametersLastUpdated: os.clock(),
			parameters: {
				...state.parameters,
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
