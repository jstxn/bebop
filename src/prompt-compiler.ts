import path from 'path';
import { AutoConfig } from './auto-config';
import { DetectedContext } from './context-detector';
import { matchesGlob } from './fs-utils';
import { PackRegistry, PackRule } from './pack-registry';
import { errors } from './errors';
import { EnforcementViolation, runEnforcement } from './enforcement';

export interface CompiledConstraint {
  id: string;
  text: string;
  source: string;
}

export interface CompiledPrompt {
  task: string;
  constraints: CompiledConstraint[];
  context: {
    project: string;
    service: string | null;
    framework: string | null;
  };
  stats: {
    originalTokens: number;
    compiledTokens: number;
    savings: number;
    ruleCount: number;
    missingPacks: string[];
  };
  enforcementWarnings: EnforcementViolation[];
  formatted: string;
}

export interface PromptCompilerOptions {
  registry?: PackRegistry;
  config?: AutoConfig | null;
}

export class PromptCompiler {
  private readonly registry: PackRegistry;
  private readonly config?: AutoConfig | null;

  constructor(options: PromptCompilerOptions = {}) {
    this.registry = options.registry ?? new PackRegistry();
    this.config = options.config ?? null;
  }

  async compile(
    userInput: string,
    context: DetectedContext,
    selectedPacks: string[],
    options: { enforce?: boolean } = {},
  ): Promise<CompiledPrompt> {
    const registryResult = await this.registry.loadPacks(selectedPacks);
    const allRules = registryResult.packs.flatMap((pack) => pack.rules.map((rule) => ({ ...rule, _pack: pack.id })));

    const includeAllRules = this.config?.compilation?.include_all_rules ?? false;
    const applicableRules = includeAllRules ? allRules : allRules.filter((rule) => this.ruleApplies(rule, context));

    const enforce = options.enforce ?? true;
    const enforcementResult = enforce ? runEnforcement(userInput, applicableRules) : { violations: [], warnings: [] };
    if (enforcementResult.violations.length > 0) {
      throw errors.ENFORCEMENT_FAILED(
        enforcementResult.violations.map((violation) => ({
          ruleId: violation.ruleId,
          packId: violation.packId,
          type: violation.type,
        })),
      );
    }

    const maxConstraints =
      this.config?.compilation?.max_constraints ?? this.config?.packs?.max_constraints ?? 15;

    const constraints = applicableRules
      .slice(0, maxConstraints)
      .map((rule) => ({
        id: rule.id,
        text: rule.text,
        source: rule._pack,
      }));

    const formatted = formatCompiledPrompt(userInput, constraints, context);
    const unfilteredFormatted = formatCompiledPrompt(
      userInput,
      allRules.map((rule) => ({ id: rule.id, text: rule.text, source: rule._pack })),
      context,
    );

    const compiledTokens = estimateTokens(formatted);
    const originalTokens = estimateTokens(unfilteredFormatted || userInput);
    const savings = originalTokens > 0 ? ((originalTokens - compiledTokens) / originalTokens) * 100 : 0;

    return {
      task: userInput,
      constraints,
      context: {
        project: context.project.type,
        service: context.service.name,
        framework: context.project.framework,
      },
      stats: {
        originalTokens,
        compiledTokens,
        savings: Number(savings.toFixed(1)),
        ruleCount: constraints.length,
        missingPacks: registryResult.missing,
      },
      enforcementWarnings: enforcementResult.warnings,
      formatted,
    };
  }

  private ruleApplies(rule: PackRule & { _pack?: string }, context: DetectedContext): boolean {
    const applies = rule.applies_when;
    if (!applies) return true;

    const checks: boolean[] = [];

    if (applies.languages && applies.languages.length > 0) {
      const languages = context.project.language.map((lang) => lang.toLowerCase());
      const match = applies.languages.some((lang) => languages.includes(lang.toLowerCase()));
      checks.push(match);
    }

    if (applies.paths && applies.paths.length > 0) {
      const relative = context.workspace?.relativeCwd || '.';
      const candidatePaths = [relative, path.join(relative, '')].map((p) => p.replace(/\\/g, '/'));
      const match = applies.paths.some((pattern) =>
        candidatePaths.some((candidate) => matchesGlob(pattern, candidate)),
      );
      checks.push(match);
    }

    if (applies.any === true && checks.length === 0) {
      return true;
    }

    if (checks.length === 0) {
      return true;
    }

    return checks.every(Boolean);
  }
}

export function formatCompiledPrompt(
  userInput: string,
  constraints: CompiledConstraint[],
  context: DetectedContext,
): string {
  const lines: string[] = [];
  lines.push(`Task: ${userInput}`);
  lines.push('');
  lines.push('Active constraints:');

  if (constraints.length === 0) {
    lines.push('- (no constraints selected)');
  } else {
    for (const constraint of constraints) {
      lines.push(`- [${constraint.id}] ${constraint.text} (${constraint.source})`);
    }
  }

  lines.push('');
  const base = `Context: ${context.project.type}`;
  const framework = context.project.framework ? ` (${context.project.framework})` : '';
  const service = context.service.name ? `, service ${context.service.name}` : '';
  lines.push(`${base}${framework}${service}`);

  return lines.join('\n');
}

export function estimateTokens(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words * 1.3));
}
