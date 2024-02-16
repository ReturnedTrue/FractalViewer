import { Dependency } from "@flamework/core";
import { InterpretController } from "client/controllers/InterpretController";
import { FractalId } from "shared/enums/FractalId";

export const fractalDescriptions = new Map<FractalId, string | (() => string)>([
	[FractalId.Mandelbrot, "Uses z = z^2 + c iterative formula,\nwhere z = 0 and c = coordinate"],
	[FractalId.BurningShip, "Uses z = (Re(z^2) + |Im(z^2)|) + c iterative formula,\nwhere z = 0 and c = coordinate"],
	[FractalId.Mandelbar, "Uses z = Conjugate(z)^2 + c iterative formula,\nwhere z = 0 and c = coordinate"],

	[FractalId.Julia, "Uses its 'corresponding set' iterative formula, but z = coordinate and c = given coordinate"],

	[
		FractalId.Newton,
		"Uses Newton-Raphson iterative method, with a very small epsilon, to find the closest root of the function with the starting point being the coordinate",
	],

	[
		FractalId.Buddhabrot,
		"Uses the same process as Mandelbrot, but renders based upon the relative frequency of a coordinate being a step in another coordinate becoming unstable",
	],

	[
		FractalId.BarnsleyFern,
		"Uses an iterated function system, where each set of functions for x and y have a probability to be chosen randomly." +
			"Once it has iterated n times, the coordinate provided by the values of x and y is colored green.\n\nFractal Viewer calculates n = Iterations * AxisSize",
	],

	[
		FractalId.Custom,
		() => {
			const lists = Dependency<InterpretController>().getCustomLists();

			return (
				`Starts by z = a and c = coordinate\nWhere a is your 'intial value' \nThen uses z = f(z)\nWhere f(z) is your 'calculate'\nIterates until |z| > MaxStable\n\n` +
				`Variables available for 'initial value': c, x, y\nVariables available for 'calculate': z, c, x, y, n\n\n` +
				`Functions\n\n${lists.functions}\nOperators\n\n${lists.operators}`
			);
		},
	],
]);

export const resolveDescription = (fractalId: FractalId) => {
	const description = fractalDescriptions.get(fractalId);
	if (description === undefined) return "No description";

	if (typeIs(description, "function")) {
		return description();
	}

	return description;
};
