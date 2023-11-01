import { complexSquare, complexPow, complexSine, complexCos, complexTan } from "client/controllers/CalculationController/ComplexMath";
import { NewtonFunction } from "shared/enums/NewtonFunction";

type NewtonFunctionDefinedRoots = {
	// Real, imaginary, root hue
	roots: Array<[number, number, number]>;
};

type NewtonFunctionCalculatedRoots = {
	determineClosestRoot: (size: number) => number;
	rootHueCache: Map<number, number>;
};

export type NewtonFunctionData = {
	execute: (real: number, imaginary: number) => LuaTuple<[number, number]>;
	derivativeExecute: (real: number, imaginary: number) => LuaTuple<[number, number]>;
} & (NewtonFunctionDefinedRoots | NewtonFunctionCalculatedRoots);

export const newtonFunctionData = new Map<NewtonFunction, NewtonFunctionData>([
	[
		NewtonFunction.Quadratic,
		{
			roots: [
				[-1, 0, 0.1],
				[1, 0, 0.2],
			],

			execute: (real, imaginary) => {
				const [squaredReal, squaredImaginary] = complexSquare(real, imaginary);

				return $tuple(squaredReal - 1, squaredImaginary);
			},

			derivativeExecute: (real, imaginary) => {
				return $tuple(2 * real, 2 * imaginary);
			},
		},
	],

	[
		NewtonFunction.Cubic,
		{
			roots: [
				[1, 0, 0.1],
				[-0.5, math.sqrt(3) / 2, 0.2],
				[-0.5, -math.sqrt(3) / 2, 0.3],
			],

			execute: (real, imaginary) => {
				const [cubedReal, cubedImaginary] = complexPow(real, imaginary, 3);

				return $tuple(cubedReal - 1, cubedImaginary);
			},

			derivativeExecute: (real, imaginary) => {
				const [squaredReal, squaredImaginary] = complexSquare(real, imaginary);

				return $tuple(3 * squaredReal, 3 * squaredImaginary);
			},
		},
	],

	[
		NewtonFunction.Quartic,
		{
			roots: [
				[1, 0, 0.1],
				[-1, 0, 0.2],
				[0, 1, 0.3],
				[0, -1, 0.4],
			],

			execute: (real, imaginary) => {
				const [poweredReal, poweredImaginary] = complexPow(real, imaginary, 4);

				return $tuple(poweredReal - 1, poweredImaginary);
			},

			derivativeExecute: (real, imaginary) => {
				const [cubedReal, cubedImaginary] = complexPow(real, imaginary, 3);

				return $tuple(4 * cubedReal, 4 * cubedImaginary);
			},
		},
	],

	[
		NewtonFunction.Sine,
		{
			rootHueCache: new Map(),
			determineClosestRoot: (size) => {
				return math.round(size / math.pi) * math.pi;
			},

			execute: complexSine,
			derivativeExecute: complexCos,
		},
	],

	[
		NewtonFunction.Cos,
		{
			rootHueCache: new Map(),
			determineClosestRoot: (size) => {
				return math.round(size / (math.pi / 2)) * (math.pi / 2);
			},

			execute: complexCos,

			// -sin(x)
			derivativeExecute: (real, imaginary) => {
				const [sineReal, sineImaginary] = complexSine(real, imaginary);

				return $tuple(-sineReal, -sineImaginary);
			},
		},
	],

	/*[
		NewtonFunction.Tan,
		{
			rootHueCache: new Map(),
			determineClosestRoot: (size) => {
				return math.round(size / math.pi) * math.pi;
			},

			execute: complexTan,

			// sec^2(x)
			derivativeExecute: (real, imaginary) => {
				const [cosineReal, cosineImaginary] = complexCos(real, imaginary);
				const [squaredReal, squaredImaginary] = complexSquare(cosineReal, cosineImaginary);

				return $tuple(1 / squaredReal, 1 / squaredImaginary);
			},
		},
	],
	*/
]);
