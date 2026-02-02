import type { Tool, ToolResult } from '../providers/types';

export class FileReadTool implements Tool {
  name = 'file_read';
  description = 'Read the contents of a file. For large files, only relevant sections are returned.';
  inputSchema = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to read',
      },
      query: {
        type: 'string',
        description: 'Optional query to rank relevant sections (used for large files)',
      },
    },
    required: ['path'],
  };

  async execute(input: unknown): Promise<ToolResult> {
    const { path: filePath, query } = input as { path?: string; query?: string };

    if (!filePath || typeof filePath !== 'string') {
      return { success: false, error: 'path is required and must be a string' };
    }

    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf-8');

      // Simple chunking for large files - smarter version will come in Phase 5
      const MAX_SIZE = 2000; // tokens approximately
      const estimatedTokens = this.estimateTokens(content);

      if (estimatedTokens <= MAX_SIZE) {
        return { success: true, data: content };
      }

      // For large files, return first and last chunks with context
      const lines = content.split('\n');
      const header = lines.slice(0, 30).join('\n');
      const footer = lines.slice(-30).join('\n');

      const truncated = `${header}\n\n... (${lines.length - 60} lines omitted) ...\n\n${footer}`;

      return {
        success: true,
        data: truncated,
      };
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'ENOENT') {
        return { success: false, error: `File not found: ${filePath}` };
      } else if (error.code === 'EISDIR') {
        return { success: false, error: `Path is a directory: ${filePath}` };
      }
      return { success: false, error: `Failed to read file: ${error.message}` };
    }
  }

  private estimateTokens(text: string): number {
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.ceil(words * 1.3);
  }
}

export class FileWriteTool implements Tool {
  name = 'file_write';
  description = 'Write content to a file. Shows a diff before applying changes.';
  inputSchema = {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: 'Path to the file to write',
      },
      content: {
        type: 'string',
        description: 'Content to write to the file',
      },
    },
    required: ['path', 'content'],
  };

  async execute(input: unknown): Promise<ToolResult> {
    const { path: filePath, content } = input as { path?: string; content?: string };

    if (!filePath || typeof filePath !== 'string') {
      return { success: false, error: 'path is required and must be a string' };
    }

    if (content === undefined || typeof content !== 'string') {
      return { success: false, error: 'content is required and must be a string' };
    }

    try {
      const fs = await import('fs/promises');

      // Generate diff
      let existingContent = '';
      let hasExisting = false;

      try {
        existingContent = await fs.readFile(filePath, 'utf-8');
        hasExisting = true;
      } catch (err) {
        // File doesn't exist, which is fine
      }

      const diff = this.generateDiff(existingContent, content, filePath);

      // For MVP, we return the diff and require approval
      return {
        success: true,
        data: {
          diff,
          isNewFile: !hasExisting,
          preview: this.truncateContent(content, 500),
        },
      };
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      return { success: false, error: `Failed to write file: ${error.message}` };
    }
  }

  async apply(input: unknown): Promise<ToolResult> {
    const { path: filePath, content } = input as { path?: string; content?: string };

    if (!filePath || typeof filePath !== 'string') {
      return { success: false, error: 'path is required and must be a string' };
    }

    if (content === undefined || typeof content !== 'string') {
      return { success: false, error: 'content is required and must be a string' };
    }

    try {
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, content, 'utf-8');
      return { success: true, data: `Successfully wrote ${filePath}` };
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      return { success: false, error: `Failed to write file: ${error.message}` };
    }
  }

  private generateDiff(oldContent: string, newContent: string, path: string): string {
    if (!oldContent) {
      return `+++ ${path}\n${newContent}`;
    }
    if (oldContent === newContent) {
      return `No changes to ${path}`;
    }

    const oldLines = oldContent.split('\n');
    const newLines = newContent.split('\n');
    const maxLen = Math.max(oldLines.length, newLines.length);

    let diff = `--- ${path}\n+++ ${path}\n`;

    for (let i = 0; i < maxLen; i++) {
      const oldLine = oldLines[i];
      const newLine = newLines[i];

      if (oldLine === newLine) {
        continue;
      }

      if (oldLine !== undefined && newLine === undefined) {
        diff += `- ${oldLine}\n`;
      } else if (oldLine === undefined && newLine !== undefined) {
        diff += `+ ${newLine}\n`;
      } else {
        diff += `- ${oldLine}\n+ ${newLine}\n`;
      }
    }

    return diff;
  }

  private truncateContent(content: string, maxLines: number): string {
    const lines = content.split('\n');
    if (lines.length <= maxLines) {
      return content;
    }
    return `${lines.slice(0, maxLines).join('\n')}\n... (${lines.length - maxLines} more lines)`;
  }
}

export class ShellExecuteTool implements Tool {
  name = 'shell_execute';
  description = 'Execute a shell command. Returns stdout and stderr.';
  inputSchema = {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'Command to execute',
      },
      cwd: {
        type: 'string',
        description: 'Working directory for the command (default: current directory)',
      },
      timeout: {
        type: 'number',
        description: 'Timeout in seconds (default: 30)',
      },
    },
    required: ['command'],
  };

  async execute(input: unknown): Promise<ToolResult> {
    const { command, cwd: workDir, timeout: timeoutSeconds = 30 } =
      input as { command?: string; cwd?: string; timeout?: number };

    if (!command || typeof command !== 'string') {
      return { success: false, error: 'command is required and must be a string' };
    }

    try {
      const { exec } = await import('child_process');

      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve({
            success: false,
            error: `Command timed out after ${timeoutSeconds}s: ${command}`,
          });
        }, timeoutSeconds * 1000);

        exec(command, { cwd: workDir, encoding: 'utf-8' }, (error, stdout, stderr) => {
          clearTimeout(timer);

          if (error) {
            resolve({
              success: false,
              error: `Command failed: ${error.message}\nStderr: ${stderr}`,
              data: { stdout, stderr },
            });
          } else {
            resolve({
              success: true,
              data: {
                stdout: stdout || '',
                stderr: stderr || '',
                exitCode: 0,
              },
            });
          }
        });
      });
    } catch (err) {
      const error = err as Error;
      return { success: false, error: `Failed to execute command: ${error.message}` };
    }
  }
}

export const DEFAULT_TOOLS = [
  new FileReadTool(),
  new FileWriteTool(),
  new ShellExecuteTool(),
];
