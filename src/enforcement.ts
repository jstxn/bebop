import { PackRule } from './pack-registry';

export type EnforcementLevel = 'block' | 'warn';

export interface EnforcementViolation {
  ruleId: string;
  packId: string | undefined;
  type: string;
  pattern: string;
  level: EnforcementLevel;
}

export interface EnforcementResult {
  violations: EnforcementViolation[];
  warnings: EnforcementViolation[];
}

export function runEnforcement(
  input: string,
  rules: Array<PackRule & { _pack?: string }>,
): EnforcementResult {
  const violations: EnforcementViolation[] = [];
  const warnings: EnforcementViolation[] = [];

  for (const rule of rules) {
    const enforce = rule.enforce;
    if (!enforce || typeof enforce !== 'object') continue;

    const type = String(enforce.type || '');
    if (!type) continue;

    const patterns = extractPatterns(type, enforce);
    if (patterns.length === 0) continue;

    const level: EnforcementLevel = enforce.level === 'warn' ? 'warn' : 'block';

    for (const pattern of patterns) {
      const regex = compilePattern(pattern);
      if (!regex) continue;

      if (regex.test(input)) {
        const entry: EnforcementViolation = {
          ruleId: rule.id,
          packId: rule._pack,
          type,
          pattern,
          level,
        };

        if (level === 'warn') {
          warnings.push(entry);
        } else {
          violations.push(entry);
        }
      }
    }
  }

  return { violations, warnings };
}

function extractPatterns(type: string, enforce: Record<string, any>): string[] {
  if (type === 'secret-scan') {
    return normalizePatterns(enforce.patterns || enforce.deny_patterns || []);
  }
  if (type === 'diff-scan') {
    return normalizePatterns(enforce.deny_patterns || enforce.patterns || []);
  }

  return normalizePatterns(enforce.patterns || enforce.deny_patterns || []);
}

function normalizePatterns(patterns: unknown): string[] {
  if (!patterns) return [];
  if (Array.isArray(patterns)) {
    return patterns.map(String).filter(Boolean);
  }
  return [String(patterns)].filter(Boolean);
}

function compilePattern(pattern: string): RegExp | null {
  const trimmed = pattern.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('/') && trimmed.lastIndexOf('/') > 0) {
    const lastSlash = trimmed.lastIndexOf('/');
    const body = trimmed.slice(1, lastSlash);
    const flags = trimmed.slice(lastSlash + 1) || 'i';
    try {
      return new RegExp(body, flags);
    } catch {
      return null;
    }
  }

  try {
    return new RegExp(trimmed, 'i');
  } catch {
    return null;
  }
}
