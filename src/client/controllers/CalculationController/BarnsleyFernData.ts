import { BarnsleyFernName } from "shared/enums/BarnsleyFernName";

export type BarnsleyFernTerms = {
	probability: number;

	a: number;
	b: number;
	c: number;
	d: number;
	e: number;
	f: number;
};

export type BarnsleyFernData = {
	correctionalX: number;
	correctionalY: number;
	correctionalDenominator: number;
	possibleTerms: Array<BarnsleyFernTerms>;
};

export const barnsleyFernData = new Map<BarnsleyFernName, BarnsleyFernData>([
	[
		BarnsleyFernName.Barnsley,
		{
			correctionalX: 0,
			correctionalY: 1,
			correctionalDenominator: 11.5,
			possibleTerms: [
				{ probability: 0.01, a: 0, b: 0, c: 0, d: 0.16, e: 0, f: 0 },
				{ probability: 0.85, a: 0.85, b: 0.04, c: -0.04, d: 0.85, e: 0, f: 1.6 },
				{ probability: 0.07, a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6 },
				{ probability: 0.07, a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44 },
			],
		},
	],

	[
		BarnsleyFernName.Cyclosorus,
		{
			correctionalX: 0,
			correctionalY: 1.5,
			correctionalDenominator: 9,
			possibleTerms: [
				{ probability: 0.02, a: 0, b: 0, c: 0, d: 0.25, e: 0, f: -0.4 },
				{ probability: 0.84, a: 0.95, b: 0.005, c: -0.005, d: 0.93, e: -0.002, f: 0.5 },
				{ probability: 0.07, a: 0.035, b: -0.2, c: 0.16, d: 0.04, e: -0.09, f: 0.02 },
				{ probability: 0.07, a: -0.04, b: 0.2, c: 0.16, d: 0.04, e: 0.083, f: 0.12 },
			],
		},
	],
]);
