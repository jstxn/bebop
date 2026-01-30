import { AutoConfig } from './auto-config';
import { DetectedContext } from './context-detector';

export interface PackSelectionRules {
  alwaysInclude: string[];
  conditional: {
    projectType: Record<string, string[]>;
    language: Record<string, string[]>;
    framework: Record<string, string[]>;
    service: Record<string, string[]>;
  };
  keywords: Record<string, string[]>;
  maxConstraints: number;
  minConfidence: number;
}

export interface PackSelectionResult {
  packs: string[];
  reasons: Record<string, string[]>;
}

const DEFAULT_RULES: PackSelectionRules = {
  alwaysInclude: ['core/security', 'core/code-quality'],
  conditional: {
    projectType: {
      frontend: ['framework/react'],
      backend: ['framework/nestjs'],
      mobile: ['framework/react-native'],
      library: [],
    },
    language: {
      typescript: ['core/typescript'],
      javascript: ['core/javascript'],
      python: ['core/python'],
      go: ['core/go'],
      rust: ['core/rust'],
    },
    framework: {
      nestjs: ['framework/nestjs'],
      express: ['framework/express'],
      react: ['framework/react'],
      nextjs: ['framework/nextjs'],
      vue: ['framework/vue'],
      nuxt: ['framework/nuxt'],
      angular: ['framework/angular'],
      svelte: ['framework/svelte'],
      django: ['framework/django'],
      flask: ['framework/flask'],
      fastapi: ['framework/fastapi'],
      rails: ['framework/rails'],
      spring: ['framework/spring'],
      'react-native': ['framework/react-native'],
    },
    service: {},
  },
  keywords: {
    test: ['tasks/testing'],
    security: ['tasks/security'],
    performance: ['tasks/performance'],
  },
  maxConstraints: 15,
  minConfidence: 0.7,
};

export class PackSelector {
  private readonly rules: PackSelectionRules;
  private readonly config?: AutoConfig | null;

  constructor(config?: AutoConfig | null, rules: PackSelectionRules = DEFAULT_RULES) {
    this.rules = rules;
    this.config = config || null;
  }

  async select(context: DetectedContext, userInput?: string): Promise<PackSelectionResult> {
    const selected = new Set<string>();
    const reasons: Record<string, string[]> = {};

    const autoSelect = this.config?.packs?.auto_select || {};
    const includeType = autoSelect.type_specific ?? true;
    const includeFramework = autoSelect.framework_specific ?? true;
    const includeService = autoSelect.service_specific ?? true;
    const includeLanguage = autoSelect.language_specific ?? true;
    const includeKeywords = autoSelect.keyword_specific ?? true;

    const alwaysInclude = this.config?.packs?.always_include || this.rules.alwaysInclude;
    this.addAll(selected, alwaysInclude, 'always', reasons);

    if (includeType) {
      const byType = this.rules.conditional.projectType[context.project.type] || [];
      this.addAll(selected, byType, `project:${context.project.type}`, reasons);
    }

    if (includeLanguage) {
      for (const lang of context.project.language) {
        const matches = this.rules.conditional.language[lang] || [];
        this.addAll(selected, matches, `language:${lang}`, reasons);
      }
    }

    if (includeFramework && context.project.framework) {
      const matches = this.rules.conditional.framework[context.project.framework] || [];
      this.addAll(selected, matches, `framework:${context.project.framework}`, reasons);
    }

    if (includeService && context.service.name) {
      this.addAll(selected, [`services/${context.service.name}`], `service:${context.service.name}`, reasons);
      const configured = this.rules.conditional.service[context.service.name] || [];
      this.addAll(selected, configured, `service:${context.service.name}`, reasons);
    }

    if (includeKeywords) {
      const keywords = context.task.keywords;
      for (const keyword of keywords) {
        const packs = this.rules.keywords[keyword] || [];
        this.addAll(selected, packs, `keyword:${keyword}`, reasons);
      }

      const customKeywords = this.config?.keywords || {};
      for (const [keyword, packs] of Object.entries(customKeywords)) {
        if (keywords.includes(keyword)) {
          this.addAll(selected, packs, `keyword:${keyword}`, reasons);
        }
      }
    }

    if (this.config?.packs?.additional) {
      this.addAll(selected, this.config.packs.additional, 'config:additional', reasons);
    }

    this.applyKeywordOverrides(selected, context.task.keywords, reasons);

    const output = Array.from(selected).filter(Boolean);
    return { packs: output, reasons };
  }

  private addAll(selected: Set<string>, packs: string[], reason: string, reasons: Record<string, string[]>): void {
    for (const pack of packs) {
      if (!pack) continue;
      selected.add(pack);
      if (!reasons[pack]) {
        reasons[pack] = [];
      }
      reasons[pack].push(reason);
    }
  }

  private applyKeywordOverrides(selected: Set<string>, keywords: string[], reasons: Record<string, string[]>): void {
    const compilation = this.config?.compilation;
    if (!compilation) return;

    const keywordMap: Array<[string, typeof compilation.on_keyword_test | undefined]> = [
      ['test', compilation.on_keyword_test],
      ['security', compilation.on_keyword_security],
      ['performance', compilation.on_keyword_performance],
    ];

    for (const [keyword, override] of keywordMap) {
      if (!override || !keywords.includes(keyword)) continue;

      if (override.add_packs) {
        this.addAll(selected, override.add_packs, `override:${keyword}`, reasons);
      }
      if (override.remove_packs) {
        for (const pack of override.remove_packs) {
          selected.delete(pack);
          if (reasons[pack]) {
            reasons[pack].push(`removed:${keyword}`);
          } else {
            reasons[pack] = [`removed:${keyword}`];
          }
        }
      }
    }
  }
}
