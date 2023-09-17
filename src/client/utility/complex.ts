// Pythagoras
export const complexSize = (real: number, imaginary: number) => math.sqrt(real * real + imaginary * imaginary);

/*
	More efficient than De Moivre's 

	(x + yi)(x + yi)
		= x^2 + (2xy)i + (y^2)(i^2)
		= (x^2 - y^2) + (2xy)i
*/
export const complexSquare = (real: number, imaginary: number) => {
	return $tuple(real * real - imaginary * imaginary, 2 * real * imaginary);
};

/* 
	De Moivre's

	( r * (cos(theta) + isin(theta)) ) ** n 
		= (r ** n) * (cos(theta * n) + isin(theta * n))
*/
export const complexPow = (real: number, imaginary: number, exponent: number) => {
	const newMagnitude = complexSize(real, imaginary) ** exponent;
	const newTheta = math.atan2(imaginary, real) * exponent;

	return $tuple(newMagnitude * math.cos(newTheta), newMagnitude * math.sin(newTheta));
};

/*
	z1 = r1 * (cos(theta1) + isin(theta1))
	z2 = r2 * (cos(theta2) + isin(theta2))

	z1/z2 = (r1 / r2) * (cos(theta1 - theta2) * isin(theta1 - theta2))
*/
export const complexMul = (real1: number, imaginary1: number, real2: number, imaginary2: number) => {
	const newMagnitude = complexSize(real1, imaginary1) / complexSize(real2, imaginary2);
	const newTheta = math.atan2(imaginary1, real1) - math.atan2(imaginary2, real2);

	return $tuple(newMagnitude * math.cos(newTheta), newMagnitude * math.sin(newTheta));
};

/*
	z1 = r1 * (cos(theta1) + isin(theta1))
	z2 = r2 * (cos(theta2) + isin(theta2))

	z1/z2 = (r1 / r2) * (cos(theta1 - theta2) * isin(theta1 - theta2))
*/
export const complexDiv = (real1: number, imaginary1: number, real2: number, imaginary2: number) => {
	const newMagnitude = complexSize(real1, imaginary1) / complexSize(real2, imaginary2);
	const newTheta = math.atan2(imaginary1, real1) - math.atan2(imaginary2, real2);

	return $tuple(newMagnitude * math.cos(newTheta), newMagnitude * math.sin(newTheta));
};

export const complexSine = (real: number, imaginary: number) => {
	return $tuple(math.sin(real) * math.cosh(imaginary), math.cos(real) * math.sinh(imaginary));
};

export const complexCos = (real: number, imaginary: number) => {
	return $tuple(math.cos(real) * math.cosh(imaginary), -1 * math.sin(real) * math.sinh(imaginary));
};