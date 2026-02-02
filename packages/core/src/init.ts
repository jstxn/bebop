import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileExists } from './fs-utils';

export interface InitOptions {
  registryPath?: string;
  auto?: boolean;
  installAliases?: boolean;
  installHooks?: boolean;
  installPlugins?: boolean;
}

export interface InitRegistryResult {
  registryPath: string;
  createdDirs: string[];
  copiedTemplates: string[];
}

export interface AutoIntegrationResult {
  detected: Record<string, boolean>;
  installed: Record<string, boolean>;
  warnings: string[];
}

const DEFAULT_REGISTRY_DIRS = ['packs', 'plans', 'sessions', 'projects', 'logs'];
const BEBOP_AGENTS_MARKER = '# Agent Instructions: Bebop';

export async function initRegistry(options: InitOptions = {}): Promise<InitRegistryResult> {
  const registryPath = options.registryPath || path.join(os.homedir(), '.bebop');
  const createdDirs: string[] = [];

  await fs.mkdir(registryPath, { recursive: true });
  for (const dir of DEFAULT_REGISTRY_DIRS) {
    const fullPath = path.join(registryPath, dir);
    if (!(await fileExists(fullPath))) {
      await fs.mkdir(fullPath, { recursive: true });
      createdDirs.push(fullPath);
    }
  }

  const copiedTemplates = await copyTemplates(registryPath);
  await copyOrAppendAgentsFile(registryPath);

  return {
    registryPath,
    createdDirs,
    copiedTemplates,
  };
}

export async function installAutoIntegration(options: InitOptions = {}): Promise<AutoIntegrationResult> {
  const detected = detectAiTools();
  const installed: Record<string, boolean> = {};
  const warnings: string[] = [];

  const installHooks = options.installHooks ?? true;
  const installPlugins = options.installPlugins ?? true;
  const installAliases = options.installAliases ?? true;

  if (installHooks && detected.claude) {
    try {
      await installClaudeHook();
      installed.claude = true;
    } catch (error) {
      warnings.push(`Claude hook install failed: ${stringifyError(error)}`);
      installed.claude = false;
    }
  }

  if (installHooks && detected.cursor) {
    try {
      await installCursorHook();
      installed.cursor = true;
    } catch (error) {
      warnings.push(`Cursor hook install failed: ${stringifyError(error)}`);
      installed.cursor = false;
    }
  }

  if (installPlugins && detected.opencode) {
    try {
      await installOpencodePlugin();
      installed.opencode = true;
    } catch (error) {
      warnings.push(`opencode plugin install failed: ${stringifyError(error)}`);
      installed.opencode = false;
    }
  }

  if (installAliases) {
    try {
      await installShellAliases(detected);
      installed.aliases = true;
    } catch (error) {
      warnings.push(`Shell alias install failed: ${stringifyError(error)}`);
      installed.aliases = false;
    }
  }

  return { detected, installed, warnings };
}

export function detectAiTools(): Record<string, boolean> {
  return {
    claude: commandExists('claude'),
    cursor: commandExists('cursor'),
    opencode: commandExists('opencode'),
    codex: commandExists('codex'),
  };
}

function commandExists(command: string): boolean {
  try {
    const cmd = process.platform === 'win32' ? `where ${command}` : `command -v ${command}`;
    execSync(cmd, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function copyTemplates(registryPath: string): Promise<string[]> {
  const copied: string[] = [];
  const templatesRoot = path.resolve(__dirname, '..', 'templates');
  const packsSource = path.join(templatesRoot, 'packs');
  const plansSource = path.join(templatesRoot, 'plans');

  copied.push(...(await copyTemplateDir(packsSource, path.join(registryPath, 'packs'))));
  copied.push(...(await copyTemplateDir(plansSource, path.join(registryPath, 'plans'))));

  return copied;
}

async function copyTemplateDir(sourceDir: string, destDir: string): Promise<string[]> {
  const copied: string[] = [];
  if (!(await fileExists(sourceDir))) {
    return copied;
  }

  await fs.mkdir(destDir, { recursive: true });
  const entries = await fs.readdir(sourceDir);

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry);
    const destPath = path.join(destDir, entry);
    if (await fileExists(destPath)) {
      continue;
    }

    const stats = await fs.stat(sourcePath);
    if (!stats.isFile()) continue;

    await fs.copyFile(sourcePath, destPath);
    copied.push(destPath);
  }

  return copied;
}

async function copyOrAppendAgentsFile(registryPath: string): Promise<void> {
  const sourceFile = path.resolve(__dirname, '..', 'AGENTS.md');
  const destFile = path.join(registryPath, 'AGENTS.md');

  if (!(await fileExists(sourceFile))) {
    return;
  }

  const sourceContent = await fs.readFile(sourceFile, 'utf8');

  if (!(await fileExists(destFile))) {
    await fs.writeFile(destFile, sourceContent, 'utf8');
    return;
  }

  const existingContent = await fs.readFile(destFile, 'utf8');

  if (existingContent.includes(BEBOP_AGENTS_MARKER)) {
    return;
  }

  const separator = existingContent.endsWith('\n') ? '\n---\n\n' : '\n\n---\n\n';
  const appendedContent = existingContent + separator + sourceContent;
  await fs.writeFile(destFile, appendedContent, 'utf8');
}

async function installClaudeHook(): Promise<void> {
  const baseDir = path.join(os.homedir(), '.claude');
  const hooksDir = path.join(baseDir, 'hooks');
  await fs.mkdir(hooksDir, { recursive: true });

  const hookPath = path.join(hooksDir, 'bebop-hook.sh');
  await writeHookScript(hookPath, 'claude');
  await mergeHookSettings(path.join(baseDir, 'settings.json'), hookPath);
}

async function installCursorHook(): Promise<void> {
  const baseDir = path.join(os.homedir(), '.cursor');
  const hooksDir = path.join(baseDir, 'hooks');
  await fs.mkdir(hooksDir, { recursive: true });

  const hookPath = path.join(hooksDir, 'bebop-hook.sh');
  await writeHookScript(hookPath, 'cursor');
  await mergeHookSettings(path.join(baseDir, 'settings.json'), hookPath);
}

async function installOpencodePlugin(): Promise<void> {
  const pluginDir = path.join(os.homedir(), '.config', 'opencode', 'plugin');
  await fs.mkdir(pluginDir, { recursive: true });

  const pluginPath = path.join(pluginDir, 'bebop.js');
  if (await fileExists(pluginPath)) {
    const existing = await fs.readFile(pluginPath, 'utf8');
    if (!existing.includes('Bebop Auto Integration')) {
      throw new Error(`Plugin already exists at ${pluginPath}`);
    }
  }

  const content = `// Bebop Auto Integration
const { execSync } = require('child_process');

module.exports = {
  name: 'bebop',
  version: '1.0.0',
  sessionHooks: {
    async onUserPrompt(userInput) {
      if (userInput.trim().startsWith('/bebop')) {
        try {
          const summary = execSync('bebop stats --session --tool opencode', {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
          });
          return summary.trim();
        } catch {
          return 'Bebop stats unavailable.';
        }
      }

      if (userInput.includes('Active constraints:')) {
        return userInput;
      }

      try {
        const compiled = execSync('bebop hook compile --tool opencode', {
          input: userInput,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'ignore'],
        });
        return compiled.trim();
      } catch {
        return userInput;
      }
    },
  },
};
`;

  await fs.writeFile(pluginPath, content, 'utf8');
}

async function installShellAliases(detected: Record<string, boolean>): Promise<void> {
  const shell = process.env.SHELL || '';
  const candidates: string[] = [];
  const home = os.homedir();

  if (shell.includes('zsh')) {
    candidates.push(path.join(home, '.zshrc'));
  }
  if (shell.includes('bash')) {
    candidates.push(path.join(home, '.bashrc'));
  }

  const fallbackFiles = [path.join(home, '.zshrc'), path.join(home, '.bashrc')];
  for (const file of fallbackFiles) {
    if (!(await fileExists(file)) && !candidates.includes(file)) {
      candidates.push(file);
    }
  }

  const tools = Object.entries(detected)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  if (tools.length === 0) return;

  const block = buildAliasBlock(tools);
  for (const rcFile of candidates) {
    await upsertBlock(rcFile, block);
  }
}

async function upsertBlock(filePath: string, block: string): Promise<void> {
  const start = '# >>> bebop';
  const end = '# <<< bebop';
  const exists = await fileExists(filePath);
  const content = exists ? await fs.readFile(filePath, 'utf8') : '';

  const blockWithMarkers = `${start}\n${block}\n${end}`;
  if (content.includes(start) && content.includes(end)) {
    const updated = content.replace(new RegExp(`${start}[\\s\\S]*?${end}`, 'm'), blockWithMarkers);
    await fs.writeFile(filePath, updated, 'utf8');
    return;
  }

  const newline = content.endsWith('\n') || content.length === 0 ? '' : '\n';
  const updated = `${content}${newline}\n${blockWithMarkers}\n`;
  await fs.writeFile(filePath, updated, 'utf8');
}

function buildAliasBlock(tools: string[]): string {
  const functions: string[] = [];

  const template = (tool: string) => `# Bebop automatic integration for ${tool}
${tool}() {
  local input="$*"
  if [[ "$1" == "/bebop"* ]]; then
    if [[ "$input" == "/bebop start"* ]]; then
      bebop hook session-start --tool ${tool}
    elif [[ "$input" == "/bebop end"* ]] || [[ "$input" == "/bebop summary"* ]]; then
      bebop hook session-end --tool ${tool}
    else
      bebop stats --session --tool ${tool}
    fi
    return 0
  fi

  if [[ "$input" == *"Active constraints:"* ]]; then
    command ${tool} "$@"
    return $?
  fi

  if [[ $# -eq 0 ]]; then
    command ${tool}
    return $?
  fi

  # Don't interfere with piped/redirected stdin.
  if [ ! -t 0 ]; then
    command ${tool} "$@"
    return $?
  fi

  # If the user provides an explicit end-of-options delimiter, treat everything after it as the prompt.
  local -a prefix=()
  local -a prompt_parts=()
  local after_delim=0
  for arg in "$@"; do
    if [[ $after_delim -eq 0 ]]; then
      prefix+=("$arg")
      if [[ "$arg" == "--" ]]; then
        after_delim=1
      fi
    else
      prompt_parts+=("$arg")
    fi
  done

	  if [[ $after_delim -eq 1 ]]; then
	    if [[ \${#prompt_parts[@]} -eq 0 ]]; then
	      command ${tool} "$@"
	      return $?
	    fi
	    local prompt_text="\${prompt_parts[*]}"
	    local compiled=""
	    compiled=$(bebop compile --tool ${tool} <<< "$prompt_text") || return $?
	    command ${tool} "\${prefix[@]}" "$compiled"
	    return $?
	  fi

  # If directives are present, treat the first directive (and everything after it) as the prompt.
  prefix=()
  prompt_parts=()
  local in_prompt=0
  for arg in "$@"; do
    if [[ $in_prompt -eq 0 && "$arg" == &* ]]; then
      in_prompt=1
    fi
    if [[ $in_prompt -eq 1 ]]; then
      prompt_parts+=("$arg")
    else
      prefix+=("$arg")
    fi
  done

	  if [[ $in_prompt -eq 1 ]]; then
	    local prompt_text="\${prompt_parts[*]}"
	    local compiled=""
	    compiled=$(bebop compile --tool ${tool} <<< "$prompt_text") || return $?
	    if [[ \${#prefix[@]} -gt 0 ]]; then
	      command ${tool} "\${prefix[@]}" "$compiled"
	    else
	      command ${tool} "$compiled"
	    fi
	    return $?
	  fi

  # If flags are present but we can't safely tell what is prompt vs. flag values, pass through unchanged.
  for arg in "$@"; do
    if [[ "$arg" == -* ]]; then
      command ${tool} "$@"
      return $?
    fi
  done

  local compiled=""
  compiled=$(bebop compile --tool ${tool} <<< "$input") || return $?
  command ${tool} "$compiled"
}`;

  for (const tool of tools) {
    functions.push(template(tool));
  }

  return functions.join('\n\n');
}

async function writeHookScript(hookPath: string, toolName: string): Promise<void> {
  // Claude Code hook that adds constraints as additionalContext
  // This does NOT modify the user's prompt - it adds context for Claude to see
  const content = `#!/bin/bash
# Bebop auto integration hook for ${toolName}
# Adds compiled constraints as additional context without modifying the prompt

set -e

# Read JSON input from stdin
INPUT=$(cat)

# Extract the prompt and working directory
PROMPT=$(echo "$INPUT" | jq -r '.prompt // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // "."')

# Skip if no prompt
if [ -z "$PROMPT" ]; then
  exit 0
fi

# Skip if prompt is very short (likely a command or simple response)
WORD_COUNT=$(echo "$PROMPT" | wc -w | xargs)
if [ "$WORD_COUNT" -lt 3 ]; then
  exit 0
fi

# Skip if prompt starts with / (slash command)
if [[ "$PROMPT" == /* ]]; then
  exit 0
fi

# Skip if prompt already contains constraints
if [[ "$PROMPT" == *"Active constraints:"* ]]; then
  exit 0
fi

# Run bebop compile-auto to get constraints
COMPILED=$(bebop compile-auto "$PROMPT" --cwd "$CWD" --tool "${toolName}" 2>/dev/null) || {
  # If bebop fails, continue without constraints
  exit 0
}

# Skip if compilation produced no useful output
if [ -z "$COMPILED" ] || [ "$COMPILED" = "null" ]; then
  exit 0
fi

# Extract the "Active constraints" section (includes Context line)
CONSTRAINTS=$(echo "$COMPILED" | sed -n '/^Active constraints:/,/^Context:/p')

# If we got constraints, output them as additional context
if [ -n "$CONSTRAINTS" ]; then
  # Escape for JSON and output
  ESCAPED=$(echo "$CONSTRAINTS" | sed 's/\\\\/\\\\\\\\/g' | sed 's/"/\\\\"/g' | tr '\\n' ' ')
  cat << EOF
{
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": "$ESCAPED"
  }
}
EOF
fi

exit 0
`;

  if (await fileExists(hookPath)) {
    const existing = await fs.readFile(hookPath, 'utf8');
    if (!existing.includes('Bebop auto integration hook')) {
      throw new Error(`Hook already exists at ${hookPath}`);
    }
  }

  await fs.writeFile(hookPath, content, { encoding: 'utf8', mode: 0o755 });
  await fs.chmod(hookPath, 0o755);
}

async function mergeHookSettings(settingsPath: string, hookScriptPath: string): Promise<void> {
  const exists = await fileExists(settingsPath);
  const settings = exists ? await readJson(settingsPath) : {};

  const hooks = settings.hooks && typeof settings.hooks === 'object' ? settings.hooks : {};
  const entries = Array.isArray(hooks.UserPromptSubmit) ? hooks.UserPromptSubmit : [];

  // UserPromptSubmit doesn't support matchers - it fires on every prompt
  // Check if we already have a bebop hook entry
  const bebopEntry = entries.find((entry: any) => {
    const hooksList = Array.isArray(entry?.hooks) ? entry.hooks : [];
    return hooksList.some((hook: any) => hook?.command?.includes('bebop'));
  });

  const commandEntry = { type: 'command', command: hookScriptPath };

  if (!bebopEntry) {
    // Add new entry for bebop
    entries.push({ hooks: [commandEntry] });
  } else {
    // Update existing bebop entry
    const hooksList = Array.isArray(bebopEntry.hooks) ? bebopEntry.hooks : [];
    const existsCommand = hooksList.some((hook: any) => hook?.command === hookScriptPath);
    if (!existsCommand) {
      // Replace old bebop hook with new one
      const filtered = hooksList.filter((hook: any) => !hook?.command?.includes('bebop'));
      filtered.push(commandEntry);
      bebopEntry.hooks = filtered;
    }
  }

  hooks.UserPromptSubmit = entries;
  settings.hooks = hooks;

  await fs.mkdir(path.dirname(settingsPath), { recursive: true });
  await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
}

async function readJson(filePath: string): Promise<Record<string, any>> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function stringifyError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
