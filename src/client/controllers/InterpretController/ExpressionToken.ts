export enum ExpressionTokenCategory {
	Whitespace = "whitespace",
	Number = "number",
	Operator = "operator",
	Variable = "variable",
	ImaginaryConstant = "imaginary constant",
	Function = "function",
	Parenthesis = "parenthesis",
	Comma = "comma",
}

export interface ExpressionToken {
	category: ExpressionTokenCategory;
	content: string;
}
