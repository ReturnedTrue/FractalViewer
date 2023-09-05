import { Action, createReducer } from "@rbxts/rodux";
import { FractalId } from "shared/enums/fractal";

interface SetPartsFolder extends Action<"setPartsFolder"> {
	partsFolder: Folder;
}

interface UpdateParameters extends Action<"updateParameters"> {
	parameters: Partial<FractalState["parameters"]>;
}

interface UpdateSingleParameter extends Action<"updateSingleParameter"> {
	name: FractalParameterName;
	value: FractalParameters[this["name"]];
}

interface ResetParameters extends Action<"resetParameters"> {}

export type FractalActions = SetPartsFolder | UpdateParameters | UpdateSingleParameter | ResetParameters;
export interface FractalState {
	parametersLastUpdated: number;
	parameters: {
		fractalId: FractalId;
		xOffset: number;
		yOffset: number;
		magnification: number;
		juliaRealConstant: number;
		juliaImaginaryConstant: number;
	};

	hasCacheBeenVoided: boolean;
	partsFolder: Folder | undefined;
}

export type FractalParameters = FractalState["parameters"];
export type FractalParameterName = keyof FractalState["parameters"];

export type FractalParameterNameForType<T> = {
	[key in FractalParameterName]: FractalParameters[key] extends T ? key : never;
}[FractalParameterName];

export type FractalParameterValueForType<T> = FractalParameters[FractalParameterNameForType<T>];

const DEFAULT_VALUE = {
	parametersLastUpdated: os.clock(),
	parameters: {
		fractalId: FractalId.Mandelbrot,
		xOffset: 0,
		yOffset: 0,
		magnification: 1,

		juliaRealConstant: 0.01,
		juliaImaginaryConstant: 0.01,
	},

	hasCacheBeenVoided: false,
	partsFolder: undefined,
} satisfies FractalState;

const parametersWhichVoidCache = new Set<FractalParameterName>([
	"fractalId",
	"magnification",
	"juliaRealConstant",
	"juliaImaginaryConstant",
]);

export const fractalReducer = createReducer<FractalState, FractalActions>(DEFAULT_VALUE, {
	setPartsFolder: (state, { partsFolder }) => {
		return { ...state, partsFolder };
	},

	updateParameters: (state, { parameters: newParameters }) => {
		let hasCacheBeenVoided = false;

		for (const [parameterName, parameterValue] of pairs(newParameters)) {
			const canVoid = parametersWhichVoidCache.has(parameterName);
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
		const hasCacheBeenVoided = parametersWhichVoidCache.has(name);

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
