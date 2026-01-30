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
        'Create a new pack with `bebop pack create --name <id>`',
        'Check the pack ID is correct (e.g., namespace/pack@version)'
      ],
      { packId: id }
    ),
  
  PLAN_NOT_FOUND: (id: string) =>
    new BebopError(
      `Plan not found: ${id}`,
      'PLAN_NOT_FOUND',
      [
        'Run `bebop plan list` to see available plans',
        'Create a new plan with `bebop plan create --name <id>`',
        'Check the plan ID is correct (e.g., namespace/plan@version)'
      ],
      { planId: id }
    ),
  
  ALIAS_NOT_FOUND: (alias: string) =>
    new BebopError(
      `Alias not found: ${alias}`,
      'ALIAS_NOT_FOUND',
      [
        'Run `bebop alias list` to see available aliases',
        'Create an alias with `bebop alias add <name> <target>`'
      ],
      { alias }
    ),
  
  // Session errors
  SESSION_NOT_FOUND: (id: string) =>
    new BebopError(
      `Session not found: ${id}`,
      'SESSION_NOT_FOUND',
      [
        'Run `bebop session list` to see available sessions',
        'Start a new session with `bebop session start`',
        'Use `bebop session continue` to resume the last session'
      ],
      { sessionId: id }
    ),
  
  NO_ACTIVE_SESSION: () =>
    new BebopError(
      'No active session. Start one with `bebop session start` or `bebop chat`',
      'NO_ACTIVE_SESSION',
      [
        'Run `bebop chat <input>` to start a new session',
        'Run `bebop session start` to create a session',
        'Run `bebop session list` to see available sessions'
      ]
    ),
  
  INVALID_SESSION_ID: (id: string) =>
    new BebopError(
      `Invalid session ID: ${id}`,
      'INVALID_SESSION_ID',
      [
        'Session IDs should be in format: session_<timestamp>_<hash>',
        'Run `bebop session list` to see valid session IDs'
      ],
      { sessionId: id }
    ),
  
  // Directive errors
  INVALID_DIRECTIVE: (directive: string, reason: string) =>
    new BebopError(
      `Invalid directive: ${directive}`,
      'INVALID_DIRECTIVE',
      [
        'Check directive syntax in `docs/cli-reference.md`',
        'Ensure parameters are in `key=value` format',
        'Run `bebop help` to see available directives'
      ],
      { directive, reason }
    ),
  
  UNKNOWN_DIRECTIVE: (directive: string) =>
    new BebopError(
      `Unknown directive: ${directive}`,
      'UNKNOWN_DIRECTIVE',
      [
        'Available directives: &use, &pack, &plan, &svc, &step, &rules, &dry-run',
        'Check directive syntax in `docs/cli-reference.md`'
      ],
      { directive }
    ),
  
  // Syntax errors
  INVALID_PACK_SYNTAX: (details: string) =>
    new BebopError(
      `Invalid pack syntax: ${details}`,
      'INVALID_PACK_SYNTAX',
      [
        'Check pack YAML syntax',
        'Run `bebop pack compile <id>` to validate',
        'See `docs/pack-authoring.md` for pack format'
      ],
      { details }
    ),
  
  INVALID_PLAN_SYNTAX: (details: string) =>
    new BebopError(
      `Invalid plan syntax: ${details}`,
      'INVALID_PLAN_SYNTAX',
      [
        'Check plan YAML syntax',
        'Run `bebop plan compile <id>` to validate',
        'See `docs/plan-authoring.md` for plan format'
      ],
      { details }
    ),
  
  INVALID_CONFIG: (key: string, value: string, reason: string) =>
    new BebopError(
      `Invalid config value: ${key} = ${value}`,
      'INVALID_CONFIG',
      [
        'Run `bebop config get` to see current config',
        'Run `bebop config set <key> <value>` to set a valid value',
        'See `docs/cli-reference.md` for valid config options'
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
        'Run `bebop init --import <file>` from the correct directory',
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
        'Run `bebop plan show <id>` to see all steps',
        'Use `&step N` to jump to a valid step'
      ],
      { step, totalSteps }
    ),
  
  PLAN_ALREADY_RUNNING: (sessionId: string) =>
    new BebopError(
      `Plan already running in session: ${sessionId}`,
      'PLAN_ALREADY_RUNNING',
      [
        'Run `bebop session show` to see the current session',
        'End the session with `bebop session end` to start a new plan',
        'Use `bebop step <N>` to continue the current plan'
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
        'Use `&rules -${ruleId}` to disable this rule temporarily'
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
        'See `docs/pack-authoring.md` for import requirements'
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
