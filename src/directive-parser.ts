export interface ParsedDirectives {
  packs: string[];
  cleanedInput: string;
  hasDirectives: boolean;
}

export function parseDirectives(input: string): ParsedDirectives {
  const tokens = input.split(/\s+/).filter(Boolean);
  const packs: string[] = [];
  const cleanedTokens: string[] = [];

  let i = 0;
  let hasDirectives = false;

  while (i < tokens.length) {
    const token = tokens[i];
    if (token.startsWith('&')) {
      hasDirectives = true;
      if (token === '&use') {
        i += 1;
        // Only accept tokens containing '/' as pack names (format: namespace/name)
        while (i < tokens.length && !tokens[i].startsWith('&') && tokens[i].includes('/')) {
          packs.push(tokens[i]);
          i += 1;
        }
        continue;
      }
      if (token === '&pack') {
        const next = tokens[i + 1];
        if (next && !next.startsWith('&')) {
          packs.push(next);
          i += 2;
          continue;
        }
      }
      // Skip directive token and move on
      i += 1;
      continue;
    }

    cleanedTokens.push(token);
    i += 1;
  }

  return {
    packs,
    cleanedInput: cleanedTokens.join(' '),
    hasDirectives,
  };
}
