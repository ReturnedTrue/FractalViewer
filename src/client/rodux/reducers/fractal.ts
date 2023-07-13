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

export type FractalActions = SetPartsFolder | SetFractal | UpdateParameters;
export interface FractalState {
	fractalId: FractalId;
	parametersLastUpdated: number;
	parameters: {
		xOffset: number;
		yOffset: number;
		magnification: number;
	};

	partsFolder: Folder | undefined;
}

const DEFAULT_VALUE = {
	fractalId: FractalId.Mandelbrot,
	parametersLastUpdated: os.clock(),
	parameters: {
		xOffset: 0,
		yOffset: 0,
		magnification: 1,
	},

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
		};
	},

	updateParameters: (state, { parameters: newParameters }) => {
		return {
			...state,
			parametersLastUpdated: os.clock(),
			parameters: {
				...state.parameters,
				...newParameters,
			},
		};
	},
});
