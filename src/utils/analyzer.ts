export function findHardcodedStrings(content: string): { text: string, start: number, end: number }[] {
	const regex = />\s*([^\n<>{}\[\]()=;:"'`]+)\s*</g;
	const results: { text: string, start: number, end: number }[] = [];
  
	for (const match of content.matchAll(regex)) {
	  const text = match[1].trim();
  
	  if (
		/^&[a-zA-Z0-9#]+;$/.test(text) ||               // HTML entities like &nbsp;
		/^[\[\](){}<>]*$/.test(text) ||                 // only brackets
		/^[\[\(<].*[\])>]$/.test(text) ||               // <T>, [T], (x)
		/^[a-zA-Z_]+\([\s\S]*\);?$/.test(text) ||       // function calls like t('key')
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
  