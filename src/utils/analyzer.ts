export function findHardcodedStrings(content: string): { text: string, start: number, end: number }[] {
	const regex = />\s*([^<>{}]*[a-zA-Z][^<>{}]*)\s*</g;
	const results: { text: string, start: number, end: number }[] = [];

	for (const match of content.matchAll(regex)) {
		const text = match[1].trim();
	
		if (/^&[a-zA-Z0-9#]+;$/.test(text)) {
			continue;
		}
	
		const start = match.index! + 1;
		const end = start + text.length;
	
		results.push({ text, start, end });
	}

	return results;
}
