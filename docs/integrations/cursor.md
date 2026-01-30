# Cursor Integration Guide

Bebop works seamlessly with Cursor's AI coding assistant through CLI middleware.

## Quick Start

### Option 1: Terminal Integration (Recommended)

1. **Install bebop:**
   ```bash
   npm install -g @bebophq/cli
   bebop init
   ```

2. **Set up environment:**
   ```bash
   # Create a helper function in your shell
   # Add to ~/.bashrc, ~/.zshrc, or ~/.config/fish/config.fish
   
   # Bash/Zsh:
   function cc() {
       local input="$*"
       local compiled=$(bebop compile "$input")
       echo "$compiled" | pbcopy  # macOS
       # echo "$compiled" | xclip -selection clipboard  # Linux
       echo "✅ Compiled prompt copied to clipboard"
       echo "Paste into Cursor chat"
   }
   
   # Fish:
   function cc
       set -l input (string join ' ' $argv)
       set -l compiled (bebop compile $input)
       echo $compiled | pbcopy  # macOS
       echo "✅ Compiled prompt copied to clipboard"
       echo "Paste into Cursor chat"
   end
   ```

3. **Usage:**
   ```bash
   cc &use core example Create a user authentication system
   ```
   
   Then paste the compiled prompt into Cursor's chat.

### Option 2: Cursor CLI Integration

1. **Create bebop-cursor wrapper:**
   ```bash
   # Save as ~/bin/bebop-cursor
   # Make executable: chmod +x ~/bin/bebop-cursor
   
   #!/bin/bash
   USER_INPUT="$@"
   COMPILED_PROMPT=$(bebop compile "$USER_INPUT")
   echo "$COMPILED_PROMPT" | cursor chat
   ```

2. **Add to PATH:**
   ```bash
   export PATH="$HOME/bin:$PATH"
   ```

3. **Usage:**
   ```bash
   bebop-cursor &use core example Create a REST API
   ```

### Option 3: Cursor Extension (Advanced)

1. **Create extension:**
   ```json
   {
     "name": "bebop-cursor",
     "displayName": "Bebop for Cursor",
     "description": "Optimize prompts with bebop",
     "version": "0.1.0",
     "main": "./extension.js",
     "contributes": {
       "commands": [
         {
           "command": "bebop.compileAndSend",
           "title": "Bebop: Compile and Send"
         },
         {
           "command": "bebop.compileOnly",
           "title": "Bebop: Compile Only"
         }
       ]
     }
   }
   ```

2. **Extension implementation:**
   ```javascript
   // extension.js
   const { spawn } = require('child_process');
   
   function compilePrompt(input) {
     return new Promise((resolve, reject) => {
       const bebop = spawn('bebop', ['compile', input]);
       let output = '';
       
       bebop.stdout.on('data', (data) => {
         output += data.toString();
       });
       
       bebop.on('close', (code) => {
         if (code === 0) resolve(output);
         else reject(new Error('Bebop compilation failed'));
       });
     });
   }
   
   async function compileAndSend() {
     const editor = vscode.window.activeTextEditor;
     const selection = editor.selection;
     const input = editor.document.getText(selection);
     
     try {
       const compiled = await compilePrompt(input);
       // Send to Cursor's chat
       vscode.commands.executeCommand('cursor.chat.send', compiled);
     } catch (error) {
       vscode.window.showErrorMessage(`Error: ${error.message}`);
     }
   }
   
   module.exports = {
     activate(context) {
       const disposable = vscode.commands.registerCommand(
         'bebop.compileAndSend',
         compileAndSend
       );
       context.subscriptions.push(disposable);
     }
   };
   ```

3. **Install in Cursor:**
   ```bash
   cursor --install-extension ~/path/to/bebop-cursor
   ```

## Usage Examples

### Basic Usage

```bash
# Simple task
cc &use core example Create a user authentication system

# With constraints
cc &use core example Add JWT authentication with refresh tokens

# With service context
cc &svc userservice &plan create-endpoint route=POST:/users name=CreateUser
```

### Plan-Based Workflows

```bash
# Run a plan
cc &plan create-endpoint route=POST:/job-postings name=CreateJobPosting

# Continue a session
cc &step 2

# Jump to specific step
cc &step 4
```

### Advanced Features

```bash
# Dry run - see what would be sent
cc &dry-run &use core example Create a feature

# Override rules
cc &rules +NO_SECRETS &rules -TECH_BRIEF_FOR_SIGNIFICANT Create a quick prototype

# Use multiple packs
cc &use core nestjs &use my-monorepo/security Add authentication
```

## Configuration

### Bebop Config for Cursor

```bash
# Set Cursor as default LLM provider
bebop config set llm_provider cursor

# Set default editor
bebop config set default_editor cursor

# Set token limits
bebop config set max_tokens_per_session 10000
```

### Alias Configuration

```bash
# Add common aliases
bebop alias add screener:endpoint example/screener/create-endpoint@v1
bebop alias add auth:add-user my-monorepo/auth/add-user@v1

# Use aliases
cc &plan screener:endpoint route=POST:/users
```

## Tips and Best Practices

### 1. Start Simple

```bash
# Start with basic pack
cc &use core example Create a simple function

# Add complexity as needed
cc &use core nestjs &use my-monorepo/security Create auth service
```

### 2. Use Plans for Repetitive Tasks

```bash
# Create a plan for common workflows
cc &plan create-endpoint route=POST:/items name=CreateItem
cc &plan create-endpoint route=PUT:/items/:id name=UpdateItem
cc &plan create-endpoint route=DELETE:/items/:id name=DeleteItem
```

### 3. Leverage Session Management

```bash
# Start a session
cc &use core nestjs Build a user service
# ... work through steps ...

# Resume later
bebop session continue
```

### 4. Optimize Token Usage

```bash
# Check what would be sent
cc &dry-run Create a feature

# Review compiled prompt
# Only send if needed
```

### 5. Use Service Context

```bash
# Let bebop auto-detect your service
cd services/api/users
cc Add user CRUD endpoints

# Or specify manually
cc &svc userservice Add user CRUD endpoints
```

## Troubleshooting

### Issue: "bebop command not found"

```bash
# Check if bebop is installed
which bebop

# If not, install it
npm install -g @bebophq/cli

# Check PATH
echo $PATH
```

### Issue: "Cursor command not found"

```bash
# Check if Cursor CLI is installed
which cursor

# If not, install Cursor CLI from Cursor settings
# Or use Option 1 (terminal integration) instead
```

### Issue: "Compiled prompt too long"

```bash
# Reduce context
cc &use core example Create a simple feature

# Or adjust limits
bebop config set max_tokens_per_session 5000
```

### Issue: "Directives not being parsed"

```bash
# Check directive syntax
# Correct: &use core example
# Wrong: use core example (missing &)

# Use dry-run to see what's happening
cc &dry-run &use core example Create a feature
```

## Integration with Cursor Workflows

### Feature Development

```bash
# 1. Start session
cc &use core nestjs &plan create-feature feature=add-user-auth

# 2. Work through plan steps
# Bebop will guide you through:
# - Reading service docs
# - Implementing endpoints
# - Adding tests
# - Running validators
```

### Bug Fixes

```bash
# Quick bug fix without plan
cc &svc userservice Fix authentication bug in login endpoint

# For complex bugs, use a plan
cc &plan fix-bug service=userservice issue=AUTH_001
```

### Refactoring

```bash
# Refactor with constraints
cc &use core example Refactor user service to use JWT

# With specific rules
cc &rules +VALIDATE_TYPES &rules +NO_SECRETS Refactor auth service
```

## Performance Optimization

### 1. Cache Compiled Prompts

```bash
# Bebop automatically caches compiled prompts
# Check cache size
bebop stats

# Clear cache if needed
bebop cleanup --days 0
```

### 2. Use Efficient Packs

```bash
# See which packs you use most
bebop stats

# Remove unused packs
rm ~/.bebop/packs/unused-pack.md
```

### 3. Optimize Plan Steps

```bash
# Review plan steps
bebop plan show create-endpoint

# Edit plan to remove unnecessary steps
vim ~/.bebop/plans/create-endpoint.md
```

## Additional Resources

- [Cursor Documentation](https://cursor.sh/docs)
- [Bebop CLI Reference](../cli-reference.md)
- [Pack Authoring](../pack-authoring.md)
- [Plan Authoring](../plan-authoring.md)
- [Troubleshooting](../troubleshooting.md)

## Support

If you encounter issues with Cursor integration:
1. Check [Troubleshooting](../troubleshooting.md)
2. Report issues at https://github.com/bebop/cli/issues
3. Join Discord: https://discord.gg/bebop
