type Real = { value: number; isComplex: false };
type Complex = { value: [number, number]; isComplex: true };
export type ExpressionTerm = Real | Complex;

export function term(value: number | [number, number]) {
	return { value, isComplex: typeIs(value, "table") } as ExpressionTerm;
}
