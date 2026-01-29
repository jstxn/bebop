import fs from 'fs/promises';
import path from 'path';

export interface WorkspaceInfo {
  root: string;
  service: string | null;
  languages: string[];
  path: string;
  isGitRepo: boolean;
}

export class WorkspaceDetector {
  async detect(cwd?: string): Promise<WorkspaceInfo> {
    const workingDir = cwd || process.cwd();
    const gitRoot = await this.findGitRoot(workingDir);
    const serviceName = await this.detectServiceName(workingDir, gitRoot);
    const languages = await this.detectLanguages(workingDir);
    
    return {
      root: gitRoot || workingDir,
      service: serviceName,
      languages,
      path: workingDir,
      isGitRepo: gitRoot !== null
    };
  }
  
  private async findGitRoot(dir: string): Promise<string | null> {
    let current = dir;
    const maxIterations = 50;
    let iterations = 0;
    
    while (iterations < maxIterations) {
      const gitDir = path.join(current, '.git');
      
      try {
        const stats = await fs.stat(gitDir);
        if (stats.isDirectory()) {
          return current;
        }
      } catch {
        // .git doesn't exist, continue up
      }
      
      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
      iterations++;
    }
    
    return null;
  }
  
  private async detectServiceName(dir: string, root: string | null): Promise<string | null> {
    if (!root) return null;
    
    const relativePath = path.relative(root, dir);
    
    // Check for common monorepo patterns
    const patterns = [
      /services\/(\w+)\/?/,           // services/api/screener → screener
      /apps\/(\w+)\/?/,                // apps/web → web
      /packages\/(\w+)\/?/,            // packages/auth → auth
      /src\/(\w+)\/?/,                 // src/user → user
    ];
    
    for (const pattern of patterns) {
      const match = relativePath.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    // If we're in a directory that looks like a service
    const dirName = path.basename(dir);
    const hasPackageJson = await this.fileExists(path.join(dir, 'package.json'));
    const hasGoMod = await this.fileExists(path.join(dir, 'go.mod'));
    const hasPyProject = await this.fileExists(path.join(dir, 'pyproject.toml'));
    
    if (hasPackageJson || hasGoMod || hasPyProject) {
      return dirName;
    }
    
    return null;
  }
  
  private async detectLanguages(dir: string): Promise<string[]> {
    const languages: Set<string> = new Set();
    
    try {
      const files = await this.walkDir(dir, 100);
      
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        
        const langMap: Record<string, string> = {
          '.ts': 'typescript',
          '.tsx': 'typescript',
          '.js': 'javascript',
          '.jsx': 'javascript',
          '.py': 'python',
          '.go': 'go',
          '.rs': 'rust',
          '.java': 'java',
          '.kt': 'kotlin',
          '.swift': 'swift',
          '.rb': 'ruby',
          '.php': 'php',
          '.c': 'c',
          '.cpp': 'cpp',
          '.cs': 'csharp',
        };
        
        if (langMap[ext]) {
          languages.add(langMap[ext]);
        }
      }
    } catch (error) {
      // If we can't read the directory, return empty
      return [];
    }
    
    return Array.from(languages);
  }
  
  private async walkDir(dir: string, maxFiles: number = 100): Promise<string[]> {
    const files: string[] = [];
    
    async function walk(current: string) {
      if (files.length >= maxFiles) return;
      
      try {
        const entries = await fs.readdir(current, { withFileTypes: true });
        
        for (const entry of entries) {
          if (files.length >= maxFiles) break;
          
          if (entry.name === 'node_modules' || entry.name === '.git') {
            continue;
          }
          
          const fullPath = path.join(current, entry.name);
          
          if (entry.isDirectory()) {
            await walk(fullPath);
          } else if (entry.isFile()) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Skip directories we can't read
      }
    }
    
    await walk(dir);
    return files;
  }
  
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
