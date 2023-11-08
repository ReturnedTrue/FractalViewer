/*import { FibonacciFunction } from "shared/enums/FibonacciFunction";
import { complexPow, modulus } from "./ComplexMath";

const fibonacci = (n: number) => {
	if (n <= 1) return n;

	let a = 0;
	let b = 1;

	for (const _ of $range(2, n + 1)) {
		[a, b] = [b, a + b];
	}

	return b;
};

export const fibonacciFunctionData = new Map<
	FibonacciFunction,
	(
		zReal: number,
		zImaginary: number,
		cReal: number,
		cImaginary: number,
		iteration: number,
	) => LuaTuple<[number, number]>
>([
	// Peanut
	[
		FibonacciFunction.PowerOfFibMod,
		(zReal: number, zImaginary: number, cReal: number, cImaginary: number, iteration: number) => {
			[zReal, zImaginary] = complexPow(zReal, zImaginary, fibonacci(modulus(zReal, zImaginary)));
			[zReal, zImaginary] = [zReal + cReal, zImaginary + cImaginary];

			return $tuple(zReal, zImaginary);
		},
	],

	// Brain scan
	[
		FibonacciFunction.PowerOfFibModMinusIteration,
		(zReal: number, zImaginary: number, cReal: number, cImaginary: number, iteration: number) => {
			[zReal, zImaginary] = complexPow(zReal, zImaginary, fibonacci(modulus(zReal, zImaginary) - iteration));
			[zReal, zImaginary] = [zReal + cReal, zImaginary + cImaginary];

			return $tuple(zReal, zImaginary);
		},
	],

	// Eye of cthulhu
	[
		FibonacciFunction.PowerOfFibModMinusLnIteration,
		(zReal: number, zImaginary: number, cReal: number, cImaginary: number, iteration: number) => {
			[zReal, zImaginary] = complexPow(
				zReal,
				zImaginary,
				fibonacci(modulus(zReal, zImaginary) - math.log(iteration)),
			);
			[zReal, zImaginary] = [zReal + cReal, zImaginary + cImaginary];

			return $tuple(zReal, zImaginary);
		},
	],

	// Reverse eye
	[
		FibonacciFunction.PowerOfFibExpModMinusLnIteration,
		(zReal: number, zImaginary: number, cReal: number, cImaginary: number, iteration: number) => {
			[zReal, zImaginary] = complexPow(
				zReal,
				zImaginary,
				fibonacci(math.exp(modulus(zReal, zImaginary)) - math.log(iteration)),
			);
			[zReal, zImaginary] = [zReal + cReal, zImaginary + cImaginary];

			return $tuple(zReal, zImaginary);
		},
	],

	// Found other shapes:
	// z^(fib(tan(|z|))) + c > bomb
	// z^(fib(tan(n))) + c > butterfly

	// TODO create an equation parser

	// Testing area
	[
		FibonacciFunction.Testing,
		(zReal: number, zImaginary: number, cReal: number, cImaginary: number, iteration: number) => {
			[zReal, zImaginary] = complexPow(zReal, zImaginary, fibonacci(modulus(zReal, zImaginary)));
			[zReal, zImaginary] = [zReal + cReal, zImaginary + cImaginary];

			return $tuple(zReal, zImaginary);
		},
	],
]);
*/
