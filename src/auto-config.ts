import path from 'path';
import os from 'os';
import yaml from 'yaml';
import { findUp, readFileIfExists } from './fs-utils';

export interface AutoConfig {
  project?: {
    type?: 'frontend' | 'backend' | 'mobile' | 'library';
    framework?: string;
    language?: string | string[];
    is_monorepo?: boolean;
    service_name?: string;
  };
  packs?: {
    always_include?: string[];
    additional?: string[];
    auto_select?: {
      type_specific?: boolean;
      framework_specific?: boolean;
      service_specific?: boolean;
      language_specific?: boolean;
      keyword_specific?: boolean;
    };
    max_constraints?: number;
    min_confidence?: number;
  };
  keywords?: Record<string, string[]>;
  compilation?: {
    max_constraints?: number;
    min_confidence?: number;
    include_all_rules?: boolean;
    on_keyword_test?: KeywordOverride;
    on_keyword_security?: KeywordOverride;
    on_keyword_performance?: KeywordOverride;
  };
  debug?: {
    enabled?: boolean;
    log_file?: string;
    show_selected_packs?: boolean;
    show_compiled_prompt?: boolean;
  };
}

export interface KeywordOverride {
  add_packs?: string[];
  remove_packs?: string[];
}

const DEFAULT_CONFIG_NAMES = ['.bebop-auto.yaml', '.bebop-auto.yml'];

export async function loadAutoConfig(cwd?: string): Promise<{ config: AutoConfig | null; path: string | null }> {
  const startDir = cwd || process.cwd();
  const configPath = await findUp(startDir, DEFAULT_CONFIG_NAMES);

  if (!configPath) {
    return { config: null, path: null };
  }

  const raw = await readFileIfExists(configPath);
  if (!raw) {
    return { config: null, path: configPath };
  }

  const parsed = yaml.parse(raw) as AutoConfig;
  return { config: parsed || null, path: configPath };
}

export function resolveAutoConfigPath(customPath?: string): string {
  if (customPath) {
    return customPath;
  }
  return path.join(os.homedir(), '.bebop-auto.yaml');
}
