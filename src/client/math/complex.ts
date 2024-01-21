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
	z1 = a + bi
	z2 = c + di

	If d = 0 then apply De Moivre's 
	
	z1^c = ( r * ( cos(theta) + isin(theta) ) ) ^ c
	     = (r ** c) * (cos(theta * c) + isin(theta * c)) 

	Else apply t = e^ln(t)

	z1^z2 = e^ln(z1^z2)
	      = e^(z2 * ln(z1))
*/
export const complexPow = (
	baseReal: number,
	baseImaginary: number,
	exponentReal: number,
	exponentImaginary: number,
) => {
	if (exponentImaginary === 0) {
		const newMagnitude = modulus(baseReal, baseImaginary) ** exponentReal;
		const newTheta = math.atan2(baseImaginary, baseReal) * exponentReal;

		return $tuple(newMagnitude * math.cos(newTheta), newMagnitude * math.sin(newTheta));
	}

	const [baseLogReal, baseLogImaginary] = complexLn(baseReal, baseImaginary);
	const [multipliedReal, multipliedImaginary] = complexMul(
		exponentReal,
		exponentImaginary,
		baseLogReal,
		baseLogImaginary,
	);

	const [resultReal, resultImaginary] = complexExp(multipliedReal, multipliedImaginary);

	return $tuple(resultReal, resultImaginary);
};

/*
	z1 = a + bi
	z2 = c + di

	z1 * z2 = (a + bi)(c + di) 
			= ac + adi + bci + bd(i^2)
			= (ac - bd) + (bc + ad)i
*/
export const complexMul = (real1: number, imaginary1: number, real2: number, imaginary2: number) => {
	const real = real1 * real2 - imaginary1 * imaginary2;
	const imaginary = imaginary1 * real2 + real1 * imaginary2;

	return $tuple(real, imaginary);
};

/*
	z1 = a + bi
	z2 = c + di

	z1 / z2 = (a + bi) / (c + di)
	        = (a + bi)(c - di) / (c + di)(c - di)
			= ( ac - adi + bci - bd(i^2) ) / (c^2 + d^2)
			= ( (ac + bd) + (bc - ad)i ) / (c^2 + d^2)
*/
export const complexDiv = (real1: number, imaginary1: number, real2: number, imaginary2: number) => {
	const denominator = real2 * real2 + imaginary2 * imaginary2;
	if (denominator === 0) return $tuple(math.huge, math.huge);

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

export const complexSinh = (real: number, imaginary: number) => {
	const [positiveExpReal, positiveExpImaginary] = complexExp(real, imaginary);
	const [negativeExpReal, negativeExpImaginary] = complexExp(-real, -imaginary);

	return $tuple((positiveExpReal - negativeExpReal) / 2, (positiveExpImaginary - negativeExpImaginary) / 2);
};

export const complexCosh = (real: number, imaginary: number) => {
	const [positiveExpReal, positiveExpImaginary] = complexExp(real, imaginary);
	const [negativeExpReal, negativeExpImaginary] = complexExp(-real, -imaginary);

	return $tuple((positiveExpReal + negativeExpReal) / 2, (positiveExpImaginary + negativeExpImaginary) / 2);
};

export const complexTanh = (real: number, imaginary: number) => {
	const [positiveExpReal, positiveExpImaginary] = complexExp(real, imaginary);
	const [negativeExpReal, negativeExpImaginary] = complexExp(-real, -imaginary);

	const sinhReal = (positiveExpReal - negativeExpReal) / 2;
	const sinhImaginary = (positiveExpImaginary - negativeExpImaginary) / 2;

	const coshReal = (positiveExpReal + negativeExpReal) / 2;
	const coshImaginary = (positiveExpImaginary + negativeExpImaginary) / 2;

	const [divdedReal, divdedImaginary] = complexDiv(sinhReal, sinhImaginary, coshReal, coshImaginary);

	return $tuple(divdedReal, divdedImaginary);
};

/*
	Using exponential form

	z = x + yi

	ln(z) = ln(re^itheta) 
	      = ln(r) + itheta
*/
export const complexLn = (real: number, imaginary: number) => {
	const magnitude = math.log(modulus(real, imaginary));
	const theta = math.atan2(imaginary, real);

	return $tuple(magnitude, theta);
};

/* 
	Using log change of base formula

	z1 = x + yi
	z2 = x + yi

	log(z1, z2) = ln(z1) / ln(z2)
*/
export const complexLog = (baseReal: number, baseImaginary: number, valueReal: number, valueImaginary: number) => {
	const [baseLogReal, baseLogImaginary] = complexLn(baseReal, baseImaginary);
	const [valueLogReal, valueLogImaginary] = complexLn(valueReal, valueImaginary);

	const [dividedReal, dividedImaginary] = complexDiv(baseLogReal, baseLogImaginary, valueLogReal, valueLogImaginary);

	return $tuple(dividedReal, dividedImaginary);
};

/*
	Using euler's formula

	z = x + yi

	e^z = e^x * (cos(y) + isin(y))
*/
export const complexExp = (real: number, imaginary: number) => {
	const realExp = math.exp(real);

	return $tuple(realExp * math.cos(imaginary), realExp * math.sin(imaginary));
};
