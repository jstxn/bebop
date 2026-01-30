import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { WorkspaceDetector } from './workspace-detector';
import { AutoConfig, loadAutoConfig } from './auto-config';
import { fileExists, findUp, normalizePath } from './fs-utils';

export type ProjectType = 'frontend' | 'backend' | 'mobile' | 'library';
export type MonorepoType = 'nx' | 'turborepo' | 'yarn-workspaces' | 'lerna' | 'unknown';
export type BranchType = 'feature' | 'bugfix' | 'release' | 'main' | 'unknown';
export type TaskType = 'feature' | 'bugfix' | 'refactor' | 'test' | 'documentation' | 'unknown';
export type TaskComplexity = 'low' | 'medium' | 'high';

export interface DetectedContext {
  project: {
    type: ProjectType;
    framework: string | null;
    language: string[];
    isMonorepo: boolean;
    monorepoType: MonorepoType;
  };
  service: {
    name: string | null;
    root: string | null;
  };
  git: {
    branch: string;
    branchType: BranchType;
    isPr: boolean;
  };
  task: {
    keywords: string[];
    complexity: TaskComplexity;
    type: TaskType;
  };
  workspace?: {
    root: string;
    cwd: string;
    serviceRoot: string | null;
    relativeCwd: string;
  };
}

const FRAMEWORK_DEPENDENCIES: Record<string, string[]> = {
  nestjs: ['@nestjs/core', '@nestjs/common', '@nestjs/platform-express'],
  express: ['express'],
  fastify: ['fastify'],
  koa: ['koa'],
  react: ['react'],
  nextjs: ['next'],
  vue: ['vue'],
  nuxt: ['nuxt'],
  angular: ['@angular/core'],
  svelte: ['svelte'],
  'react-native': ['react-native'],
};

const FRONTEND_FRAMEWORKS = new Set(['react', 'nextjs', 'vue', 'nuxt', 'angular', 'svelte']);
const BACKEND_FRAMEWORKS = new Set(['nestjs', 'express', 'fastify', 'koa', 'django', 'flask', 'rails', 'spring']);
const MOBILE_FRAMEWORKS = new Set(['react-native', 'flutter']);

const KEYWORD_SETS: Record<string, string[]> = {
  test: ['test', 'tests', 'testing', 'spec', 'specs', 'unit', 'e2e', 'integration', 'coverage'],
  security: ['security', 'secure', 'auth', 'authentication', 'jwt', 'oauth', 'password', 'encryption'],
  performance: ['performance', 'optimize', 'optimization', 'latency', 'throughput', 'speed', 'fast'],
  refactor: ['refactor', 'cleanup', 'restructure', 'rewrite', 'simplify'],
  documentation: ['doc', 'docs', 'documentation', 'readme', 'changelog'],
  bugfix: ['bug', 'fix', 'error', 'issue', 'crash', 'broken', 'failure'],
  feature: ['feature', 'add', 'create', 'implement', 'build', 'support'],
};

export class ContextDetector {
  async detect(cwd?: string, userInput?: string): Promise<DetectedContext> {
    const workingDir = cwd || process.cwd();
    const { config } = await loadAutoConfig(workingDir);

    const workspaceDetector = new WorkspaceDetector();
    const workspaceInfo = await workspaceDetector.detect(workingDir);

    const workspaceRoot = process.env.BEBOP_WORKSPACE || workspaceInfo.root || workingDir;
    const serviceRoot = await this.findServiceRoot(workingDir, workspaceRoot);

    const packageContext = await this.loadPackageContext(workingDir, workspaceRoot, serviceRoot);
    const framework = await this.detectFramework(packageContext);
    const projectType = this.detectProjectType(framework, packageContext);
    const languages = this.detectLanguagesFromWorkspace(workspaceInfo.languages, packageContext);
    const monorepo = await this.detectMonorepo(workspaceRoot);

    const task = userInput ? this.analyzeTask(userInput) : this.emptyTask();
    const git = this.detectGitContext();

    const context: DetectedContext = {
      project: {
        type: projectType,
        framework,
        language: languages,
        isMonorepo: monorepo.isMonorepo,
        monorepoType: monorepo.monorepoType,
      },
      service: {
        name: workspaceInfo.service,
        root: serviceRoot,
      },
      git,
      task,
      workspace: {
        root: workspaceRoot,
        cwd: workingDir,
        serviceRoot,
        relativeCwd: normalizePath(path.relative(workspaceRoot, workingDir) || '.'),
      },
    };

    return this.applyOverrides(context, config);
  }

  private emptyTask(): DetectedContext['task'] {
    return { keywords: [], complexity: 'low', type: 'unknown' };
  }

  private detectLanguagesFromWorkspace(languages: string[], packageContext: PackageContext): string[] {
    const detected = new Set<string>(languages.map((lang) => lang.toLowerCase()));

    if (packageContext.packageJson) {
      const deps = this.collectDependencies(packageContext.packageJson);
      if (deps.has('typescript')) {
        detected.add('typescript');
      }
      if (deps.has('javascript')) {
        detected.add('javascript');
      }
    }

    if (packageContext.hasTsConfig) {
      detected.add('typescript');
    }

    if (packageContext.hasPyProject || packageContext.hasRequirements) {
      detected.add('python');
    }

    if (packageContext.hasGoMod) {
      detected.add('go');
    }

    if (packageContext.hasCargoToml) {
      detected.add('rust');
    }

    return Array.from(detected);
  }

  private async loadPackageContext(workingDir: string, root: string, serviceRoot: string | null): Promise<PackageContext> {
    const scanRoot = serviceRoot || root;
    const packageJsonPath = await this.findNearestPackageJson(scanRoot || workingDir, root);
    const packageJson = packageJsonPath ? await this.readJson(packageJsonPath) : null;

    return {
      root,
      scanRoot,
      packageJson,
      packageJsonPath,
      hasTsConfig:
        (await fileExists(path.join(scanRoot, 'tsconfig.json'))) ||
        (await fileExists(path.join(root, 'tsconfig.json'))),
      hasPyProject:
        (await fileExists(path.join(scanRoot, 'pyproject.toml'))) ||
        (await fileExists(path.join(root, 'pyproject.toml'))),
      hasRequirements:
        (await fileExists(path.join(scanRoot, 'requirements.txt'))) ||
        (await fileExists(path.join(root, 'requirements.txt'))),
      hasGoMod:
        (await fileExists(path.join(scanRoot, 'go.mod'))) || (await fileExists(path.join(root, 'go.mod'))),
      hasCargoToml:
        (await fileExists(path.join(scanRoot, 'Cargo.toml'))) ||
        (await fileExists(path.join(root, 'Cargo.toml'))),
      hasGemfile:
        (await fileExists(path.join(scanRoot, 'Gemfile'))) || (await fileExists(path.join(root, 'Gemfile'))),
      hasPom:
        (await fileExists(path.join(scanRoot, 'pom.xml'))) || (await fileExists(path.join(root, 'pom.xml'))),
      hasGradle:
        (await fileExists(path.join(scanRoot, 'build.gradle'))) ||
        (await fileExists(path.join(root, 'build.gradle'))),
    };
  }

  private async findNearestPackageJson(start: string, stopAt: string): Promise<string | null> {
    return findUp(start, ['package.json'], stopAt);
  }

  private async readJson(filePath: string): Promise<Record<string, any> | null> {
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private collectDependencies(pkg: Record<string, any>): Set<string> {
    const deps = new Set<string>();
    const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
    for (const section of sections) {
      const entries = pkg[section];
      if (entries && typeof entries === 'object') {
        Object.keys(entries).forEach((dep) => deps.add(dep));
      }
    }
    return deps;
  }

  private async detectFramework(packageContext: PackageContext): Promise<string | null> {
    if (packageContext.packageJson) {
      const deps = this.collectDependencies(packageContext.packageJson);

      for (const [framework, identifiers] of Object.entries(FRAMEWORK_DEPENDENCIES)) {
        if (identifiers.some((id) => deps.has(id))) {
          return framework;
        }
      }
    }

    if (packageContext.hasPyProject || packageContext.hasRequirements) {
      const pythonFramework = await this.detectPythonFramework(packageContext);
      if (pythonFramework) {
        return pythonFramework;
      }
    }

    if (packageContext.hasGemfile) {
      const rails = await this.fileContainsInRoots(packageContext, 'Gemfile', 'rails');
      if (rails) {
        return 'rails';
      }
    }

    if (packageContext.hasPom || packageContext.hasGradle) {
      return 'spring';
    }

    return null;
  }

  private async detectPythonFramework(packageContext: PackageContext): Promise<string | null> {
    const candidates = ['django', 'flask', 'fastapi'];
    const filesToCheck = [
      packageContext.hasPyProject ? 'pyproject.toml' : null,
      packageContext.hasRequirements ? 'requirements.txt' : null,
      'Pipfile',
    ].filter(Boolean) as string[];

    for (const file of filesToCheck) {
      const content = await this.readFileAtRoots(packageContext, file);
      if (!content) continue;
      for (const candidate of candidates) {
        if (content.toLowerCase().includes(candidate)) {
          return candidate;
        }
      }
    }

    if (
      (await fileExists(path.join(packageContext.scanRoot, 'manage.py'))) ||
      (await fileExists(path.join(packageContext.root, 'manage.py')))
    ) {
      return 'django';
    }

    return null;
  }

  private async readFileAtRoots(packageContext: PackageContext, fileName: string): Promise<string | null> {
    const candidates = [packageContext.scanRoot, packageContext.root];
    for (const root of candidates) {
      const target = path.join(root, fileName);
      try {
        return await fs.readFile(target, 'utf8');
      } catch {
        // try next
      }
    }
    return null;
  }

  private async fileContainsInRoots(
    packageContext: PackageContext,
    fileName: string,
    token: string,
  ): Promise<boolean> {
    const content = await this.readFileAtRoots(packageContext, fileName);
    if (!content) return false;
    return content.toLowerCase().includes(token);
  }

  private detectProjectType(framework: string | null, packageContext: PackageContext): ProjectType {
    if (framework) {
      if (FRONTEND_FRAMEWORKS.has(framework)) {
        return 'frontend';
      }
      if (MOBILE_FRAMEWORKS.has(framework)) {
        return 'mobile';
      }
      if (BACKEND_FRAMEWORKS.has(framework)) {
        return 'backend';
      }
    }

    if (packageContext.packageJson) {
      const pkg = packageContext.packageJson;
      if (pkg.private === false && (pkg.main || pkg.module || pkg.types)) {
        return 'library';
      }
    }

    if (packageContext.hasGoMod || packageContext.hasPyProject || packageContext.hasCargoToml) {
      return 'backend';
    }

    return 'backend';
  }

  private async detectMonorepo(root: string): Promise<{ isMonorepo: boolean; monorepoType: MonorepoType }> {
    const nx = await fileExists(path.join(root, 'nx.json'));
    if (nx) return { isMonorepo: true, monorepoType: 'nx' };

    const turbo = await fileExists(path.join(root, 'turbo.json'));
    if (turbo) return { isMonorepo: true, monorepoType: 'turborepo' };

    const lerna = await fileExists(path.join(root, 'lerna.json'));
    if (lerna) return { isMonorepo: true, monorepoType: 'lerna' };

    const pnpm = await fileExists(path.join(root, 'pnpm-workspace.yaml'));
    if (pnpm) return { isMonorepo: true, monorepoType: 'yarn-workspaces' };

    const packageJsonPath = path.join(root, 'package.json');
    if (await fileExists(packageJsonPath)) {
      const pkg = await this.readJson(packageJsonPath);
      if (pkg && pkg.workspaces) {
        return { isMonorepo: true, monorepoType: 'yarn-workspaces' };
      }
    }

    return { isMonorepo: false, monorepoType: 'unknown' };
  }

  private detectGitContext(): DetectedContext['git'] {
    let branch = '';
    try {
      branch = execSync('git branch --show-current', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      branch = '';
    }

    const branchType = this.detectBranchType(branch);
    const isPr = Boolean(
      process.env.GITHUB_HEAD_REF ||
        process.env.CI_PULL_REQUEST ||
        process.env.GITHUB_EVENT_NAME === 'pull_request' ||
        process.env.GITHUB_EVENT_NAME === 'pull_request_target'
    );

    return {
      branch: branch || 'unknown',
      branchType,
      isPr,
    };
  }

  private detectBranchType(branch: string): BranchType {
    if (!branch) return 'unknown';
    if (branch === 'main' || branch === 'master') return 'main';
    if (branch.startsWith('feature/') || branch.startsWith('feat/')) return 'feature';
    if (branch.startsWith('bugfix/') || branch.startsWith('fix/')) return 'bugfix';
    if (branch.startsWith('release/')) return 'release';
    return 'unknown';
  }

  private analyzeTask(input: string): DetectedContext['task'] {
    const tokens = input.toLowerCase().split(/\s+/).filter(Boolean);
    const keywords: string[] = [];

    for (const [keyword, variants] of Object.entries(KEYWORD_SETS)) {
      if (tokens.some((token) => variants.includes(token))) {
        keywords.push(keyword);
      }
    }

    const wordCount = tokens.length;
    let complexity: TaskComplexity = 'medium';
    if (wordCount <= 4) complexity = 'low';
    else if (wordCount >= 15) complexity = 'high';

    if (tokens.some((token) => ['system', 'architecture', 'migration', 'refactor'].includes(token))) {
      complexity = 'high';
    }

    let type: TaskType = 'unknown';
    if (keywords.includes('bugfix')) type = 'bugfix';
    else if (keywords.includes('test')) type = 'test';
    else if (keywords.includes('refactor')) type = 'refactor';
    else if (keywords.includes('documentation')) type = 'documentation';
    else if (keywords.includes('feature')) type = 'feature';

    return { keywords, complexity, type };
  }

  private async findServiceRoot(cwd: string, root: string): Promise<string | null> {
    let current = path.resolve(cwd);
    const resolvedRoot = path.resolve(root);

    while (true) {
      if (
        (await fileExists(path.join(current, 'package.json'))) ||
        (await fileExists(path.join(current, 'pyproject.toml'))) ||
        (await fileExists(path.join(current, 'go.mod'))) ||
        (await fileExists(path.join(current, 'Cargo.toml'))) ||
        (await fileExists(path.join(current, 'Gemfile')))
      ) {
        return current;
      }

      if (current === resolvedRoot) {
        break;
      }
      const parent = path.dirname(current);
      if (parent === current) break;
      current = parent;
    }

    return null;
  }

  private applyOverrides(context: DetectedContext, config: AutoConfig | null): DetectedContext {
    if (!config || !config.project) {
      return context;
    }

    const projectOverrides = config.project;
    if (projectOverrides.type) {
      context.project.type = projectOverrides.type;
    }
    if (projectOverrides.framework) {
      context.project.framework = projectOverrides.framework;
    }
    if (projectOverrides.language) {
      const languages = Array.isArray(projectOverrides.language)
        ? projectOverrides.language
        : [projectOverrides.language];
      context.project.language = languages.map((lang) => lang.toLowerCase());
    }
    if (typeof projectOverrides.is_monorepo === 'boolean') {
      context.project.isMonorepo = projectOverrides.is_monorepo;
    }
    if (projectOverrides.service_name) {
      context.service.name = projectOverrides.service_name;
    }

    return context;
  }
}

interface PackageContext {
  root: string;
  scanRoot: string;
  packageJson: Record<string, any> | null;
  packageJsonPath: string | null;
  hasTsConfig: boolean;
  hasPyProject: boolean;
  hasRequirements: boolean;
  hasGoMod: boolean;
  hasCargoToml: boolean;
  hasGemfile: boolean;
  hasPom: boolean;
  hasGradle: boolean;
}
