import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import yaml from 'yaml';
import { fileExists } from './fs-utils';
import { errors } from './errors';

export interface PackRule {
  id: string;
  text: string;
  applies_when?: {
    any?: boolean;
    paths?: string[];
    languages?: string[];
  };
  enforce?: Record<string, any>;
}

export interface Pack {
  id: string;
  version: number | string;
  rules: PackRule[];
  sourcePath: string;
}

export interface PackLoadResult {
  packs: Pack[];
  missing: string[];
}

export interface PackRegistryOptions {
  workspaceRoot?: string;
  extraDirs?: string[];
}

export class PackRegistry {
  private readonly dirs: string[];

  constructor(options: PackRegistryOptions = {}) {
    const workspaceRoot = options.workspaceRoot || process.cwd();
    this.dirs = [
      path.join(os.homedir(), '.bebop', 'packs'),
      path.join(workspaceRoot, 'packs'),
      path.join(workspaceRoot, 'templates', 'packs'),
      ...(options.extraDirs || []),
    ];
  }

  async loadPacks(packIds: string[]): Promise<PackLoadResult> {
    const packs: Pack[] = [];
    const missing: string[] = [];

    for (const packId of packIds) {
      const pack = await this.loadPack(packId);
      if (pack) {
        packs.push(pack);
      } else {
        missing.push(packId);
      }
    }

    return { packs, missing };
  }

  async loadPack(packId: string): Promise<Pack | null> {
    const parsed = parsePackIdentifier(packId);

    for (const dir of this.dirs) {
      if (!(await fileExists(dir))) {
        continue;
      }

      const files = await fs.readdir(dir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!['.md', '.yaml', '.yml'].includes(ext)) continue;

        const fullPath = path.join(dir, file);
        const pack = await this.parsePackFile(fullPath);
        if (!pack) continue;

        if (pack.id !== parsed.id) continue;
        if (parsed.version && !versionsMatch(parsed.version, pack.version)) continue;

        return pack;
      }
    }

    return null;
  }

  async listAvailable(): Promise<Pack[]> {
    const found: Pack[] = [];

    for (const dir of this.dirs) {
      if (!(await fileExists(dir))) continue;

      const files = await fs.readdir(dir);
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!['.md', '.yaml', '.yml'].includes(ext)) continue;
        const fullPath = path.join(dir, file);
        const pack = await this.parsePackFile(fullPath);
        if (pack) {
          found.push(pack);
        }
      }
    }

    return found;
  }

  private async parsePackFile(filePath: string): Promise<Pack | null> {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const yamlSource = extractYaml(raw) ?? raw;
      const parsed = yaml.parse(yamlSource) as Partial<Pack> | null;

      if (!parsed || !parsed.id || !parsed.rules) {
        return null;
      }

      return {
        id: parsed.id,
        version: parsed.version ?? '1',
        rules: parsed.rules as PackRule[],
        sourcePath: filePath,
      };
    } catch {
      return null;
    }
  }
}

export function extractYaml(raw: string): string | null {
  const match = raw.match(/```yaml\s*([\s\S]*?)```/i);
  if (!match) return null;
  return match[1].trim();
}

export function parsePackIdentifier(input: string): { id: string; version?: string } {
  const [idPart, versionPart] = input.split('@');
  if (!versionPart) {
    return { id: idPart };
  }

  const normalized = versionPart.startsWith('v') ? versionPart.slice(1) : versionPart;
  return { id: idPart, version: normalized };
}

export function versionsMatch(requested: string, actual: string | number): boolean {
  const actualNormalized = typeof actual === 'number' ? actual.toString() : actual.replace(/^v/, '');
  return requested.replace(/^v/, '') === actualNormalized;
}

export function throwIfAllMissing(result: PackLoadResult): void {
  if (result.packs.length === 0 && result.missing.length > 0) {
    throw errors.PACK_NOT_FOUND(result.missing[0]);
  }
}
