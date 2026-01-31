#!/usr/bin/env node
import { Command } from 'commander';
import { ContextDetector } from './context-detector';
import { loadAutoConfig } from './auto-config';
import { PackSelector } from './pack-selector';
import { PromptCompiler } from './prompt-compiler';
import { PackRegistry } from './pack-registry';
import { ParsedDirectives, parseDirectives } from './directive-parser';
import { initRegistry, installAutoIntegration } from './init';
import { BebopError, errors } from './errors';
import { buildRegistry, importPack } from './pack-manager';
import {
  appendUsage,
  countWords,
  endSession,
  formatSummary,
  getActiveSession,
  readUsageRecords,
  startSession,
  summarizeUsage,
} from './usage-log';

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) return '';
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => (data += chunk));
    process.stdin.on('end', () => resolve(data.trim()));
    process.stdin.on('error', reject);
  });
}

function parseJsonMaybe(value: string): any {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function parsePacksInput(input?: string): string[] {
  if (!input) return [];
  const parsed = parseJsonMaybe(input);
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.packs)) return parsed.packs;

  return input
    .split(/[,\s]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function getInputFromArgs(args: string[] | string | undefined, fallback: string): string {
  if (fallback) return fallback;
  const list = Array.isArray(args) ? args : args ? [args] : [];
  if (list.length > 0) return list.join(' ');
  return '';
}

async function resolveContext(contextArg: string | undefined, cwd: string | undefined, input: string) {
  if (contextArg) {
    const parsed = parseJsonMaybe(contextArg);
    if (parsed) return parsed;
  }

  const detector = new ContextDetector();
  return detector.detect(cwd, input);
}

async function resolvePacks(
  packsArg: string | undefined,
  context: any,
  input: string,
  config: Awaited<ReturnType<typeof loadAutoConfig>>['config'],
  allowDirectives: boolean,
  parsedDirectives?: ParsedDirectives,
): Promise<{ packs: string[]; cleanedInput: string }> {
  const parsed = parsedDirectives ?? (allowDirectives ? parseDirectives(input) : { packs: [], cleanedInput: input });
  const cleanedInput = parsed.cleanedInput || input;

  if (parsed.packs.length > 0) {
    return { packs: parsed.packs, cleanedInput };
  }

  const packsFromArg = parsePacksInput(packsArg);
  if (packsFromArg.length > 0) {
    return { packs: packsFromArg, cleanedInput };
  }

  const selector = new PackSelector(config);
  const selection = await selector.select(context, cleanedInput);
  return { packs: selection.packs, cleanedInput };
}

function shouldEnforce(options: { enforce?: boolean }): boolean {
  if (options.enforce === false) return false;
  if (process.env.BEBOP_ENFORCE === '0') return false;
  return true;
}

function resolveTool(options: { tool?: string }): string {
  return options.tool || process.env.BEBOP_TOOL || 'cli';
}

function shouldLogUsage(): boolean {
  const raw = (process.env.BEBOP_USAGE_LOG ?? process.env.BEBOP_LOG ?? '').toLowerCase();
  return raw !== '0' && raw !== 'false' && raw !== 'off';
}

async function logCompile(
  tool: string,
  input: string,
  compiledText: string,
  compiledStats: { originalTokens: number; compiledTokens: number; savings: number; ruleCount: number },
  packs: string[],
  context: { project: string; framework: string | null; service: string | null },
): Promise<void> {
  if (!shouldLogUsage()) return;
  try {
    let session = await getActiveSession(tool);
    if (!session) {
      session = await startSession(tool);
    }
    await appendUsage({
      timestamp: new Date().toISOString(),
      tool,
      sessionId: session?.id || null,
      input: {
        chars: input.length,
        words: countWords(input),
      },
      compiled: {
        chars: compiledText.length,
        words: countWords(compiledText),
      },
      originalTokens: compiledStats.originalTokens,
      compiledTokens: compiledStats.compiledTokens,
      savingsTokens: compiledStats.originalTokens - compiledStats.compiledTokens,
      savingsPct: compiledStats.savings,
      ruleCount: compiledStats.ruleCount,
      packs,
      context,
    });
  } catch {
    // ignore logging errors
  }
}

async function run(): Promise<void> {
  const program = new Command();

  program
    .name('bebop')
    .description('Bebop CLI - automatic prompt optimization')
    .version('0.1.0');

  program
    .command('detect-context')
    .option('--cwd <path>', 'Working directory')
    .option('--input <text>', 'User input to analyze')
    .option('--json', 'Output JSON')
    .action(async (options) => {
      const stdinInput = await readStdin();
      const input = options.input || stdinInput || '';
      const detector = new ContextDetector();
      const context = await detector.detect(options.cwd, input);
      process.stdout.write(JSON.stringify(context, null, 2));
    });

  program
    .command('init')
    .option('--auto', 'Install automatic integration (hooks/plugins/aliases)')
    .option('--registry <path>', 'Registry path (default: ~/.bebop)')
    .option('--no-aliases', 'Skip shell alias installation')
    .option('--no-hooks', 'Skip hook installation')
    .option('--no-plugins', 'Skip plugin installation')
    .action(async (options) => {
      const registryResult = await initRegistry({ registryPath: options.registry });
      process.stdout.write(`Registry initialized at ${registryResult.registryPath}\n`);
      if (registryResult.createdDirs.length > 0) {
        process.stdout.write(`Created: ${registryResult.createdDirs.join(', ')}\n`);
      }
      if (registryResult.copiedTemplates.length > 0) {
        process.stdout.write(`Installed templates: ${registryResult.copiedTemplates.join(', ')}\n`);
      }

      if (options.auto) {
        const autoResult = await installAutoIntegration({
          installAliases: options.aliases,
          installHooks: options.hooks,
          installPlugins: options.plugins,
        });

        const detected = Object.entries(autoResult.detected)
          .map(([tool, value]) => `${value ? 'yes' : 'no'} ${tool}`)
          .join(', ');
        process.stdout.write(`Detected tools: ${detected}\n`);

        const installed = Object.entries(autoResult.installed)
          .map(([tool, value]) => `${value ? 'yes' : 'no'} ${tool}`)
          .join(', ');
        process.stdout.write(`Installed: ${installed}\n`);

        if (autoResult.warnings.length > 0) {
          process.stderr.write(autoResult.warnings.map((line) => `Warning: ${line}`).join('\n') + '\n');
        }
      }
    });

  program
    .command('select-packs')
    .option('--context <json>', 'Context JSON (from detect-context)')
    .option('--input <text>', 'User input')
    .option('--cwd <path>', 'Working directory')
    .option('--json', 'Output JSON')
    .option('--verbose', 'Include selection reasons')
    .action(async (options) => {
      const stdinInput = await readStdin();
      const input = options.input || stdinInput || '';
      const { config } = await loadAutoConfig(options.cwd);
      const context = await resolveContext(options.context, options.cwd, input);
      const selector = new PackSelector(config);
      const selection = await selector.select(context, input);

      if (options.json) {
        if (options.verbose) {
          process.stdout.write(JSON.stringify(selection, null, 2));
        } else {
          process.stdout.write(JSON.stringify(selection.packs, null, 2));
        }
        return;
      }

      process.stdout.write(selection.packs.join('\n'));
    });

  const pack = program.command('pack').description('Manage packs');
  pack
    .command('list')
    .option('--json', 'Output JSON')
    .option('--registry <path>', 'Registry path (default: ~/.bebop)')
    .action(async (options) => {
      const registry = buildRegistry(options.registry, process.cwd());
      const packs = await registry.listAvailable();

      if (options.json) {
        process.stdout.write(JSON.stringify(packs, null, 2));
        return;
      }

      const lines = packs.map((item) => `${item.id}@${item.version} ${item.sourcePath}`);
      process.stdout.write(lines.join('\n'));
    });

  pack
    .command('show')
    .argument('<id>', 'Pack ID (e.g., core/security@v1)')
    .option('--json', 'Output JSON')
    .option('--registry <path>', 'Registry path (default: ~/.bebop)')
    .action(async (id, options) => {
      const registry = buildRegistry(options.registry, process.cwd());
      const pack = await registry.loadPack(id);
      if (!pack) {
        throw errors.PACK_NOT_FOUND(id);
      }

      if (options.json) {
        process.stdout.write(JSON.stringify(pack, null, 2));
        return;
      }

      const lines: string[] = [];
      lines.push(`Pack: ${pack.id}@${pack.version}`);
      lines.push(`Source: ${pack.sourcePath}`);
      lines.push('Rules:');
      for (const rule of pack.rules) {
        lines.push(`- [${rule.id}] ${rule.text}`);
      }
      process.stdout.write(lines.join('\n'));
    });

  pack
    .command('import')
    .argument('<file>', 'Pack file (markdown or yaml)')
    .option('--registry <path>', 'Registry path (default: ~/.bebop)')
    .option('--force', 'Overwrite existing pack')
    .action(async (file, options) => {
      const result = await importPack(file, options.registry, { force: options.force });
      process.stdout.write(`Imported ${result.sourcePath} -> ${result.destPath}\n`);
    });

  const hook = program.command('hook');
  hook
    .command('compile')
    .option('--context <json>', 'Context JSON (from detect-context)')
    .option('--input <text>', 'User input')
    .option('--cwd <path>', 'Working directory')
    .option('--json', 'Output JSON')
    .option('--no-enforce', 'Skip enforcement hooks')
    .option('--tool <name>', 'Tool name for usage logging')
    .action(async (options) => {
      const stdinInput = await readStdin();
      const input = options.input || stdinInput || '';
      if (!input) {
        process.stderr.write('No input provided.\n');
        process.exit(1);
      }

      if (input.includes('Active constraints:')) {
        process.stdout.write(input);
        return;
      }

      const { config } = await loadAutoConfig(options.cwd);
      const context = await resolveContext(options.context, options.cwd, input);
      const selector = new PackSelector(config);
      const selection = await selector.select(context, input);

      const compiler = new PromptCompiler({
        registry: new PackRegistry({ workspaceRoot: context.workspace?.root }),
        config,
      });
      const compiled = await compiler.compile(input, context, selection.packs, { enforce: shouldEnforce(options) });
      const tool = resolveTool(options);
      await logCompile(tool, input, compiled.formatted, compiled.stats, selection.packs, compiled.context);

      if (compiled.stats.missingPacks.length > 0) {
        process.stderr.write(`Warning: missing packs: ${compiled.stats.missingPacks.join(', ')}\n`);
      }

      if (compiled.enforcementWarnings.length > 0) {
        const warnings = compiled.enforcementWarnings
          .map((warning) => `${warning.ruleId} (${warning.type})`)
          .join(', ');
        process.stderr.write(`Warning: enforcement warnings: ${warnings}\n`);
      }

      if (options.json) {
        process.stdout.write(JSON.stringify(compiled, null, 2));
      } else {
        process.stdout.write(compiled.formatted);
      }
    });

  hook
    .command('session-start')
    .option('--tool <name>', 'Tool name for session tracking')
    .action(async (options) => {
      const tool = resolveTool(options);
      const session = await startSession(tool);
      process.stderr.write(`Bebop session started: ${session.id}\n`);
    });

  hook
    .command('session-end')
    .option('--tool <name>', 'Tool name for session tracking')
    .action(async (options) => {
      const tool = resolveTool(options);
      const result = await endSession(tool);
      if (!result.summary) {
        process.stderr.write('Bebop session summary unavailable.\n');
        return;
      }
      process.stderr.write(`${formatSummary(result.summary)}\n`);
    });

  program
    .command('compile')
    .option('--context <json>', 'Context JSON (from detect-context)')
    .option('--packs <list>', 'Pack list or JSON array')
    .option('--input <text>', 'User input')
    .option('--cwd <path>', 'Working directory')
    .option('--json', 'Output JSON')
    .option('--auto', 'Ignore directives and auto-select packs')
    .option('--no-enforce', 'Skip enforcement hooks')
    .option('--tool <name>', 'Tool name for usage logging')
    .argument('[task...]', 'User task')
    .action(async (args, options) => {
      const stdinInput = await readStdin();
      const input = getInputFromArgs(args, options.input || stdinInput || '');
      if (!input) {
        process.stderr.write('No input provided.\n');
        process.exit(1);
      }

      const { config } = await loadAutoConfig(options.cwd);
      const parsedDirectives = options.auto
        ? { packs: [], cleanedInput: input, hasDirectives: false }
        : parseDirectives(input);
      const cleanedInput = parsedDirectives.cleanedInput || input;
      const context = await resolveContext(options.context, options.cwd, cleanedInput);
      const { packs } = await resolvePacks(options.packs, context, cleanedInput, config, !options.auto, parsedDirectives);

      const compiler = new PromptCompiler({
        registry: new PackRegistry({ workspaceRoot: context.workspace?.root }),
        config,
      });
      const compiled = await compiler.compile(cleanedInput, context, packs, { enforce: shouldEnforce(options) });
      const tool = resolveTool(options);
      await logCompile(tool, cleanedInput, compiled.formatted, compiled.stats, packs, compiled.context);

      if (compiled.stats.missingPacks.length > 0) {
        process.stderr.write(`Warning: missing packs: ${compiled.stats.missingPacks.join(', ')}\n`);
      }

      if (compiled.enforcementWarnings.length > 0) {
        const warnings = compiled.enforcementWarnings
          .map((warning) => `${warning.ruleId} (${warning.type})`)
          .join(', ');
        process.stderr.write(`Warning: enforcement warnings: ${warnings}\n`);
      }

      if (options.json) {
        process.stdout.write(JSON.stringify(compiled, null, 2));
      } else {
        process.stdout.write(compiled.formatted);
      }
    });

  program
    .command('compile-auto')
    .option('--context <json>', 'Context JSON (from detect-context)')
    .option('--input <text>', 'User input')
    .option('--cwd <path>', 'Working directory')
    .option('--json', 'Output JSON')
    .option('--no-enforce', 'Skip enforcement hooks')
    .option('--tool <name>', 'Tool name for usage logging')
    .argument('[task...]', 'User task')
    .action(async (args, options) => {
      const stdinInput = await readStdin();
      const input = getInputFromArgs(args, options.input || stdinInput || '');
      if (!input) {
        process.stderr.write('No input provided.\n');
        process.exit(1);
      }

      const { config } = await loadAutoConfig(options.cwd);
      const context = await resolveContext(options.context, options.cwd, input);
      const selector = new PackSelector(config);
      const selection = await selector.select(context, input);

      const compiler = new PromptCompiler({
        registry: new PackRegistry({ workspaceRoot: context.workspace?.root }),
        config,
      });
      const compiled = await compiler.compile(input, context, selection.packs, { enforce: shouldEnforce(options) });
      const tool = resolveTool(options);
      await logCompile(tool, input, compiled.formatted, compiled.stats, selection.packs, compiled.context);

      if (compiled.stats.missingPacks.length > 0) {
        process.stderr.write(`Warning: missing packs: ${compiled.stats.missingPacks.join(', ')}\n`);
      }

      if (compiled.enforcementWarnings.length > 0) {
        const warnings = compiled.enforcementWarnings
          .map((warning) => `${warning.ruleId} (${warning.type})`)
          .join(', ');
        process.stderr.write(`Warning: enforcement warnings: ${warnings}\n`);
      }

      if (options.json) {
        process.stdout.write(JSON.stringify(compiled, null, 2));
      } else {
        process.stdout.write(compiled.formatted);
      }
    });

  program
    .command('stats')
    .option('--json', 'Output JSON')
    .option('--tool <name>', 'Filter by tool')
    .option('--session', 'Summarize current session only')
    .option('--since <iso>', 'Filter records since ISO timestamp')
    .action(async (options) => {
      const tool = options.tool || null;
      if (options.session) {
        const active = await getActiveSession(tool || 'cli');
        if (!active) {
          process.stdout.write('No active session.\n');
          return;
        }
        const records = await readUsageRecords({ tool: tool || 'cli', sessionId: active.id });
        const summary = summarizeUsage(records, tool || 'cli', active.id);
        if (options.json) {
          process.stdout.write(JSON.stringify(summary, null, 2));
        } else {
          process.stdout.write(`${formatSummary(summary)}\n`);
        }
        return;
      }

      const records = await readUsageRecords({ tool: tool || undefined, since: options.since });
      const summary = summarizeUsage(records, tool, null);
      if (options.json) {
        process.stdout.write(JSON.stringify(summary, null, 2));
      } else {
        process.stdout.write(`${formatSummary(summary)}\n`);
      }
    });

  await program.parseAsync(process.argv);
}

run().catch((error) => {
  if (error instanceof BebopError) {
    process.stderr.write(`${error.toString()}\n`);
  } else {
    process.stderr.write(`${error?.message || error}\n`);
  }
  process.exit(1);
});
