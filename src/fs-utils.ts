import fs from 'fs/promises';
import path from 'path';

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readFileIfExists(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return null;
  }
}

export async function findUp(startDir: string, fileNames: string[], stopAt?: string): Promise<string | null> {
  let current = path.resolve(startDir);
  const stop = stopAt ? path.resolve(stopAt) : undefined;

  while (true) {
    for (const name of fileNames) {
      const candidate = path.join(current, name);
      if (await fileExists(candidate)) {
        return candidate;
      }
    }

    if (stop && current === stop) {
      break;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return null;
}

export function normalizePath(inputPath: string): string {
  return inputPath.split(path.sep).join('/');
}

export function globToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '__DOUBLE_STAR__')
    .replace(/\*/g, '[^/]*')
    .replace(/__DOUBLE_STAR__/g, '.*');

  return new RegExp(`^${escaped}$`);
}

export function matchesGlob(pattern: string, target: string): boolean {
  const normalizedPattern = normalizePath(pattern.trim());
  const normalizedTarget = normalizePath(target.trim());
  return globToRegExp(normalizedPattern).test(normalizedTarget);
}
