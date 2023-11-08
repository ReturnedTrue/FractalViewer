import { modulus } from "../CalculationController/ComplexMath";

export const availableFunctions = {
	mod: modulus,
} as const;

export const getAvailableFunctionNames = () => {
	const names = [];

	for (const [functionName] of pairs(availableFunctions)) {
		names.push(functionName);
	}

	return names;
};
