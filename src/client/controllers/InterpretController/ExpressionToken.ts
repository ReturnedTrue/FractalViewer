export enum ExpressionTokenCategory {
	Whitespace,
	Number,
	Operator,
	Function,
	Parenthesis,
}

export interface ExpressionToken {
	category: ExpressionTokenCategory;
	content: string;
}
