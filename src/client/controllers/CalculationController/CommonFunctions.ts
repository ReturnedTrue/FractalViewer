import { RenderingMethod } from "shared/enums/RenderingMethod";
import { FractalParameters } from "shared/types/FractalParameters";

export type ParametersNeededToResolveHue = Pick<FractalParameters, "renderingMethod" | "maxIterations" | "maxStable">;

export const resolveHue = (parameters: ParametersNeededToResolveHue, iteration: number, distance: number) => {
	switch (parameters.renderingMethod) {
		case RenderingMethod.Iteration:
			return iteration / parameters.maxIterations;

		default:
			throw "unexpected rendering method";
	}
};

export const resolveRootHueFromCache = (cache: Map<number, number>, closestRoot: number) => {
	let hue = cache.get(closestRoot);

	if (hue === undefined) {
		hue = math.random(100) / 100;
		cache.set(closestRoot, hue);
	}

	return hue;
};

export const beginTimer = () => {
	const startTime = os.clock();

	return () => {
		return string.format("(%.2f ms)", (os.clock() - startTime) * 1000);
	};
};
