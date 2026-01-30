import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { fileExists } from './fs-utils';
import { PackRegistry } from './pack-registry';
import { errors } from './errors';

export interface PackImportResult {
  sourcePath: string;
  destPath: string;
  overwritten: boolean;
}

export function resolveRegistryPath(override?: string): string {
  return override || process.env.BEBOP_REGISTRY || path.join(os.homedir(), '.bebop');
}

export function buildRegistry(registryPath?: string, cwd?: string): PackRegistry {
  const root = cwd || process.cwd();
  const resolvedRegistry = resolveRegistryPath(registryPath);
  const extraDirs = [path.join(resolvedRegistry, 'packs')];
  return new PackRegistry({ workspaceRoot: root, extraDirs });
}

export async function importPack(
  sourcePath: string,
  registryPath?: string,
  options: { force?: boolean } = {},
): Promise<PackImportResult> {
  const resolvedSource = path.resolve(sourcePath);
  if (!(await fileExists(resolvedSource))) {
    throw errors.FILE_NOT_FOUND(resolvedSource);
  }

  const stats = await fs.stat(resolvedSource);
  if (!stats.isFile()) {
    throw new Error(`Source path is not a file: ${resolvedSource}`);
  }

  const registry = resolveRegistryPath(registryPath);
  const destDir = path.join(registry, 'packs');
  await fs.mkdir(destDir, { recursive: true });

  const destPath = path.join(destDir, path.basename(resolvedSource));
  const exists = await fileExists(destPath);
  if (exists && !options.force) {
    throw new Error(`Pack already exists at ${destPath}. Use --force to overwrite.`);
  }

  await fs.copyFile(resolvedSource, destPath);

  return {
    sourcePath: resolvedSource,
    destPath,
    overwritten: exists,
  };
}
