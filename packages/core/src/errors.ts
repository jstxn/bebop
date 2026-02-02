export class BebopError extends Error {
  constructor(
    message: string,
    public code: string,
    public suggestions?: string[],
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'BebopError';
  }
  
  toString(): string {
    let output = `\x1b[31mError [${this.code}]:\x1b[0m ${this.message}`;
    
    if (this.suggestions && this.suggestions.length > 0) {
      output += '\n\n\x1b[33mSuggestions:\x1b[0m';
      this.suggestions.forEach((suggestion, index) => {
        output += `\n  ${index + 1}. ${suggestion}`;
      });
    }
    
    return output;
  }
}

export const errors = {
  // Registry errors
  REGISTRY_NOT_FOUND: () =>
    new BebopError(
      'Bebop registry not found. Run `bebop init` to set up.',
      'REGISTRY_NOT_FOUND',
      ['Run `bebop init` to initialize the registry']
    ),
  
  PACK_NOT_FOUND: (id: string) =>
    new BebopError(
      `Pack not found: ${id}`,
      'PACK_NOT_FOUND',
      [
        'Run `bebop pack list` to see available packs',
        'Import a pack from a file with `bebop pack import <file>`',
        'See `PACKS.md` for pack IDs and pack format'
      ],
      { packId: id }
    ),
  
  PLAN_NOT_FOUND: (id: string) =>
    new BebopError(
      `Plan not found: ${id}`,
      'PLAN_NOT_FOUND',
      [
        'Plan execution is not implemented in this version of Bebop',
        'See `PLANS.md` for the plan/step-runner roadmap',
        'Use `bebop compile` or `bebop compile-auto` to apply packs today'
      ],
      { planId: id }
    ),
  
  ALIAS_NOT_FOUND: (alias: string) =>
    new BebopError(
      `Alias not found: ${alias}`,
      'ALIAS_NOT_FOUND',
      [
        'Aliases are not implemented in this version of Bebop',
        'Use full pack IDs (e.g., `core/security@v1`) for now'
      ],
      { alias }
    ),
  
  // Session errors
  SESSION_NOT_FOUND: (id: string) =>
    new BebopError(
      `Session not found: ${id}`,
      'SESSION_NOT_FOUND',
      [
        'Session listing/lookup is not implemented in this version of Bebop',
        'Start a tracked session with `bebop hook session-start --tool <name>`',
        'View session stats with `bebop stats --session --tool <name>`'
      ],
      { sessionId: id }
    ),
  
  NO_ACTIVE_SESSION: () =>
    new BebopError(
      'No active session. Start one with `bebop hook session-start --tool <name>`',
      'NO_ACTIVE_SESSION',
      [
        'Start a tracked session with `bebop hook session-start --tool <name>`',
        'Running `bebop compile --tool <name>` also starts a session implicitly',
        'View session stats with `bebop stats --session --tool <name>`'
      ]
    ),
  
  INVALID_SESSION_ID: (id: string) =>
    new BebopError(
      `Invalid session ID: ${id}`,
      'INVALID_SESSION_ID',
      [
        'Session IDs should be in format: session_<timestamp>_<hash>',
        'Use `bebop stats --session --tool <name>` to see the active session ID'
      ],
      { sessionId: id }
    ),
  
  // Directive errors
  INVALID_DIRECTIVE: (directive: string, reason: string) =>
    new BebopError(
      `Invalid directive: ${directive}`,
      'INVALID_DIRECTIVE',
      [
        'Check directive syntax in `DIRECTIVES.md`',
        'Ensure parameters are in `key=value` format',
        'Run `bebop --help` to see available commands'
      ],
      { directive, reason }
    ),
  
  UNKNOWN_DIRECTIVE: (directive: string) =>
    new BebopError(
      `Unknown directive: ${directive}`,
      'UNKNOWN_DIRECTIVE',
      [
        'Available directives: &use, &pack',
        'Check directive syntax in `DIRECTIVES.md`'
      ],
      { directive }
    ),
  
  // Syntax errors
  INVALID_PACK_SYNTAX: (details: string) =>
    new BebopError(
      `Invalid pack syntax: ${details}`,
      'INVALID_PACK_SYNTAX',
      [
        'Check pack YAML/Markdown syntax',
        'Try importing again with `bebop pack import <file>` after fixing the file',
        'See `PACKS.md` for pack format'
      ],
      { details }
    ),
  
  INVALID_PLAN_SYNTAX: (details: string) =>
    new BebopError(
      `Invalid plan syntax: ${details}`,
      'INVALID_PLAN_SYNTAX',
      [
        'Plan execution is not implemented in this version of Bebop',
        'See `PLANS.md` for the plan format (roadmap)',
        'Use `bebop compile` or `bebop compile-auto` to apply packs today'
      ],
      { details }
    ),
  
  INVALID_CONFIG: (key: string, value: string, reason: string) =>
    new BebopError(
      `Invalid config value: ${key} = ${value}`,
      'INVALID_CONFIG',
      [
        'Bebop config is set via `.bebop-auto.yaml` (auto pack selection)',
        'Check the YAML file for typos and invalid values',
        'Run `bebop select-packs --json` to verify selection behavior'
      ],
      { key, value, reason }
    ),

  // Enforcement errors
  ENFORCEMENT_FAILED: (violations: Array<{ ruleId: string; packId?: string; type: string }>) =>
    new BebopError(
      `Enforcement failed for ${violations.length} rule(s).`,
      'ENFORCEMENT_FAILED',
      [
        'Remove sensitive values from your input',
        'Adjust the relevant pack enforcement rules if needed',
        'Disable enforcement with --no-enforce (if appropriate)'
      ],
      { violations }
    ),
  
  // File system errors
  FILE_NOT_FOUND: (filePath: string) =>
    new BebopError(
      `File not found: ${filePath}`,
      'FILE_NOT_FOUND',
      [
        'Check the file path is correct',
        'If importing a pack, run `bebop pack import <file>` from the correct directory',
        'Ensure you have read permissions for the file'
      ],
      { filePath }
    ),
  
  DIRECTORY_NOT_FOUND: (dirPath: string) =>
    new BebopError(
      `Directory not found: ${dirPath}`,
      'DIRECTORY_NOT_FOUND',
      [
        'Check the directory path is correct',
        'Run `bebop init` to create the bebop registry',
        'Ensure you have read permissions for the directory'
      ],
      { dirPath }
    ),
  
  // Execution errors
  STEP_OUT_OF_RANGE: (step: number, totalSteps: number) =>
    new BebopError(
      `Step ${step} is out of range (plan has ${totalSteps} steps)`,
      'STEP_OUT_OF_RANGE',
      [
        `Valid steps are 1-${totalSteps}`,
        'Plan execution is not implemented in this version of Bebop',
        'See `PLANS.md` for the plan/step-runner roadmap'
      ],
      { step, totalSteps }
    ),
  
  PLAN_ALREADY_RUNNING: (sessionId: string) =>
    new BebopError(
      `Plan already running in session: ${sessionId}`,
      'PLAN_ALREADY_RUNNING',
      [
        'Plan execution is not implemented in this version of Bebop',
        'See `PLANS.md` for the plan/step-runner roadmap',
        'Use `bebop compile` or `bebop compile-auto` to apply packs today'
      ],
      { sessionId }
    ),
  
  // Validation errors
  VALIDATION_FAILED: (ruleId: string, reason: string) =>
    new BebopError(
      `Validation failed for rule: ${ruleId}`,
      'VALIDATION_FAILED',
      [
        'Review the rule requirements',
        'Run `bebop pack show <id>` to see rule details',
        'Edit the pack rule or disable enforcement with --no-enforce (if appropriate)'
      ],
      { ruleId, reason }
    ),
  
  // Network errors
  LLM_API_ERROR: (provider: string, message: string) =>
    new BebopError(
      `LLM API error (${provider}): ${message}`,
      'LLM_API_ERROR',
      [
        'Check your API key is valid',
        'Check your internet connection',
        'Try again in a few moments'
      ],
      { provider, message }
    ),
  
  // Workspace errors
  NOT_IN_GIT_REPO: () =>
    new BebopError(
      'Not in a git repository',
      'NOT_IN_GIT_REPO',
      [
        'Initialize a git repository with `git init`',
        'Run bebop from within a git repository',
        'Use `--workspace <path>` to specify a workspace'
      ]
    ),
  
  NO_SERVICE_DETECTED: () =>
    new BebopError(
      'No service detected in current directory',
      'NO_SERVICE_DETECTED',
      [
        'Use `&svc <name>` to specify a service',
        'Run from within a service directory',
        'Check your project structure matches expected patterns'
      ]
    ),
  
  // Import/Export errors
  IMPORT_FAILED: (file: string, reason: string) =>
    new BebopError(
      `Failed to import ${file}: ${reason}`,
      'IMPORT_FAILED',
      [
        'Check the file format is valid',
        'Ensure the file is accessible',
        'See `PACKS.md` for import requirements'
      ],
      { file, reason }
    ),
  
  EXPORT_FAILED: (target: string, reason: string) =>
    new BebopError(
      `Failed to export to ${target}: ${reason}`,
      'EXPORT_FAILED',
      [
        'Check the export path is writable',
        'Ensure you have write permissions',
        'Check the export format is valid'
      ],
      { target, reason }
    ),
  
  // General errors
  UNKNOWN_ERROR: (message: string) =>
    new BebopError(
      `Unknown error: ${message}`,
      'UNKNOWN_ERROR',
      [
        'Run with `--debug` flag for more details',
        'Check bebop logs for more information',
        'Report this issue at https://github.com/bebop/cli/issues'
      ]
    ),
};

export function isBebopError(error: unknown): error is BebopError {
  return error instanceof BebopError;
}

export function handleError(error: unknown): never {
  if (isBebopError(error)) {
    console.error(error.toString());
    process.exit(1);
  } else if (error instanceof Error) {
    console.error(`\x1b[31mError:\x1b[0m ${error.message}`);
    process.exit(1);
  } else {
    console.error(`\x1b[31mUnknown error:\x1b[0m ${error}`);
    process.exit(1);
  }
}
