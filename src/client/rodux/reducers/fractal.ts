import { Action, createReducer } from "@rbxts/rodux";
import { FractalId } from "shared/enums/fractal";

interface SetPartsFolder extends Action<"setPartsFolder"> {
	partsFolder: Folder;
}

interface SetFractal extends Action<"setFractal"> {
	fractalId: FractalId;
}

interface UpdateParameters extends Action<"updateParameters"> {
	parameters: Partial<FractalState["parameters"]>;
}

interface ResetParameters extends Action<"resetParameters"> {}

export type FractalActions = SetPartsFolder | SetFractal | UpdateParameters | ResetParameters;
export interface FractalState {
	fractalId: FractalId;
	parametersLastUpdated: number;
	parameters: {
		xOffset: number;
		yOffset: number;
		magnification: number;
	};

	hasCacheBeenVoided: boolean;
	partsFolder: Folder | undefined;
}

export type FractalParameters = FractalState["parameters"];
export type FractalParametersNames = keyof FractalState["parameters"];

const parametersWhichVoidCache = new Set<FractalParametersNames>(["magnification"]);

const DEFAULT_VALUE = {
	fractalId: FractalId.Mandelbrot,
	parametersLastUpdated: os.clock(),
	parameters: {
		xOffset: 0,
		yOffset: 0,
		magnification: 1,
	},

	hasCacheBeenVoided: false,
	partsFolder: undefined,
} satisfies FractalState;

export const fractalReducer = createReducer<FractalState, FractalActions>(DEFAULT_VALUE, {
	setPartsFolder: (state, { partsFolder }) => {
		return { ...state, partsFolder };
	},

	setFractal: (state, { fractalId }) => {
		return {
			...state,
			fractalId,
			parametersLastUpdated: os.clock(),
			parameters: DEFAULT_VALUE.parameters,
			hasCacheBeenVoided: true,
		};
	},

	updateParameters: (state, { parameters: newParameters }) => {
		let hasCacheBeenVoided = false;

		for (const [parameterName, parameterValue] of pairs(newParameters)) {
			if (parametersWhichVoidCache.has(parameterName) && state.parameters[parameterName] !== parameterValue) {
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

	resetParameters: (state) => {
		return {
			...state,
			parametersLastUpdated: os.clock(),
			parameters: DEFAULT_VALUE.parameters,
			hasCacheBeenVoided: true,
		};
	},
});
