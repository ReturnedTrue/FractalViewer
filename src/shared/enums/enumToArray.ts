export function enumToArray<V>(enumGiven: Record<string, V>) {
	const arr = [];

	for (const [_, value] of pairs(enumGiven)) {
		arr.push(value);
	}

	return arr;
}
