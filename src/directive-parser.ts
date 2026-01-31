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
  const packNameTokenPattern = /^[a-z0-9][a-z0-9._@-]*$/i;
  const knownNamespaces = new Set(['core', 'framework', 'tasks', 'services']);
  const taskVerbs = new Set([
    // Keep this conservative; it's only used to avoid mis-parsing prompts as packs.
    'add',
    'build',
    'create',
    'debug',
    'document',
    'explain',
    'fix',
    'generate',
    'implement',
    'improve',
    'optimize',
    'refactor',
    'review',
    'test',
    'write',
  ]);

  while (i < tokens.length) {
    const token = tokens[i];
    if (token.startsWith('&')) {
      hasDirectives = true;
      if (token === '&use') {
        i += 1;
        while (i < tokens.length && !tokens[i].startsWith('&')) {
          const current = tokens[i];

          if (current.includes('/') || current === '*') {
            packs.push(current);
            i += 1;
            continue;
          }

          const namespace = current.toLowerCase();
          const next = tokens[i + 1];
          if (
            knownNamespaces.has(namespace) &&
            next &&
            !next.startsWith('&') &&
            !next.includes('/') &&
            packNameTokenPattern.test(next) &&
            !taskVerbs.has(next.toLowerCase())
          ) {
            packs.push(`${namespace}/${next}`);
            i += 2;
            continue;
          }

          // Stop parsing packs on the first token that doesn't unambiguously look like a pack.
          break;
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
