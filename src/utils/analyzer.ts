export function findHardcodedStrings(content: string): { text: string, start: number, end: number }[] {
	const regex = />\s*([^<>{}]*[a-zA-Z][^<>{}]*)\s*</g;
	const results: { text: string, start: number, end: number }[] = [];

	for (const match of content.matchAll(regex)) {
		const text = match[1].trim();
	  
		// 🧼 Skip unwanted matches
		if (
			/^&[a-zA-Z0-9#]+;$/.test(text) ||          // skip HTML entities like &nbsp;
			/^[\[\](){}<>]*$/.test(text) ||            // skip strings made of only brackets
			/^[\[\(<].*[\])>]$/.test(text) ||          // skip things like <T>, [T], (T)
			/^\s*$/.test(text)                         
		  ) {
			continue;
		  }
	  
		const start = match.index! + match[0].indexOf(text);
		const end = start + text.length;
		results.push({ text, start, end });
	  }
	  
	return results;
}
