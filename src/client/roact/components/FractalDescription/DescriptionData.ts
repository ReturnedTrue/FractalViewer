import { Dependency } from "@flamework/core";
import { InterpretController } from "client/controllers/InterpretController";
import { FractalId } from "shared/enums/FractalId";

export const fractalDescriptions = new Map<FractalId, string | (() => string)>([
	[FractalId.Mandelbrot, "Uses z = z^2 + c iterative formula"],
	[FractalId.BurningShip, "Uses z = (Re(z^2) + |Im(z^2)|) + c iterative formula"],
	[FractalId.Mandelbar, "Uses z = Conjugate(z)^2 + c iterative formula"],

	[FractalId.Custom, () => Dependency<InterpretController>().getCustomFractalDescription()],
]);

export const resolveDescription = (fractalId: FractalId) => {
	const description = fractalDescriptions.get(fractalId);
	if (description === undefined) return "No description";

	if (typeIs(description, "function")) {
		return description();
	}

	return description;
};
