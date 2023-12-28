//!optimize 2

// Pythagoras
export const modulus = (x: number, y: number) => math.sqrt(x * x + y * y);

/*
	More efficient than De Moivre's

	z = x + yi

	z^2 = (x + yi)(x + yi)
		= x^2 + (2xy)i + (y^2)(i^2)
		= (x^2 - y^2) + (2xy)i
*/
export const complexSquare = (real: number, imaginary: number) => {
	return $tuple(real * real - imaginary * imaginary, 2 * real * imaginary);
};

/* 
	De Moivre's

	z = r(cos(theta) + isin(theta))

	z ^ n = (r ^ n) * (cos(theta * n) + isin(theta * n))
*/
export const complexPow = (real: number, imaginary: number, exponent: number) => {
	if (exponent === 0) return $tuple(1, 0);
	if (imaginary === 0) return $tuple(real ** exponent, 0);

	const newMagnitude = modulus(real, imaginary) ** exponent;
	const newTheta = math.atan2(imaginary, real) * exponent;

	return $tuple(newMagnitude * math.cos(newTheta), newMagnitude * math.sin(newTheta));
};

/*
	z = x + yi

	a^z = a^x * a^yi

	Since a^loga(b) = b, e^ln(a) = a

	a^z = a^x * e^ln(a)yi
		= a^x * [ r( cos(theta * ln(a)) + isin(theta * ln(a)) ) ]
*/
export const realToComplexPow = (x: number, real: number, imaginary: number) => {
	const newMagnitude = modulus(real, imaginary) * x ** real;
	const newTheta = math.atan2(imaginary, real) * math.log(imaginary);

	return $tuple(newMagnitude * math.cos(newTheta), newMagnitude * math.sin(newTheta));
};

/*
	z1 = a + bi
	z2 = c + di

	z1 * z2 = (a * c - b * d) + (a * d + b * c)i
*/
export const complexMul = (real1: number, imaginary1: number, real2: number, imaginary2: number) => {
	const real = real1 * real2 - imaginary1 * imaginary2;
	const imaginary = real1 * imaginary2 + imaginary1 * real2;

	return $tuple(real, imaginary);
};

/*
	z1 = a + bi
	z2 = c + di

	z1 / z2 = ( (a * c + b * d) / (c^2 + d^2) ) + ( (b * c - a * d) / (c^2 + d^2) )i
*/
export const complexDiv = (real1: number, imaginary1: number, real2: number, imaginary2: number) => {
	const denominator = real2 * real2 + imaginary2 * imaginary2;
	if (denominator === 0) return $tuple(0, 0);

	return $tuple(
		(real1 * real2 + imaginary1 * imaginary2) / denominator,
		(imaginary1 * real2 - real1 * imaginary2) / denominator,
	);
};

export const complexSine = (real: number, imaginary: number) => {
	return $tuple(math.sin(real) * math.cosh(imaginary), math.cos(real) * math.sinh(imaginary));
};

export const complexCos = (real: number, imaginary: number) => {
	return $tuple(math.cos(real) * math.cosh(imaginary), -1 * math.sin(real) * math.sinh(imaginary));
};

export const complexTan = (real: number, imaginary: number) => {
	const realTan = math.tan(real);
	const imaginaryTanh = math.tanh(imaginary);

	return complexDiv(realTan, imaginaryTanh, 1, -1 * realTan * imaginaryTanh);
};
