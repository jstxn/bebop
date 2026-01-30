# Troubleshooting Guide

Common issues and solutions for Bebop.

## Installation Issues

### Issue: "npm install -g @bebophq/cli" fails

**Error:**
```
npm ERR! permission denied
```

**Solutions:**

1. **Use sudo (not recommended):**
   ```bash
   sudo npm install -g @bebophq/cli
   ```

2. **Fix npm permissions (recommended):**
   ```bash
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   npm install -g @bebophq/cli
   ```

3. **Use nvm (recommended for Node developers):**
   ```bash
   nvm install 18
   nvm use 18
   npm install -g @bebophq/cli
   ```

### Issue: "bebop: command not found"

**Diagnosis:**
```bash
# Check if npm is in PATH
which npm

# Check npm global location
npm config get prefix

# Check if bebop is installed
npm list -g @bebophq/cli
```

**Solutions:**

1. **Add npm global bin to PATH:**
   ```bash
   # Add to ~/.bashrc, ~/.zshrc, or ~/.config/fish/config.fish
   export PATH=$(npm config get prefix)/bin:$PATH
   ```

2. **Reinstall:**
   ```bash
   npm uninstall -g @bebophq/cli
   npm install -g @bebophq/cli
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   npm install -g @bebophq/cli
   ```

## Configuration Issues

### Issue: "Bebop registry not found"

**Error:**
```
Error [REGISTRY_NOT_FOUND]: Bebop registry not found. Run `bebop init` to set up.
```

**Solutions:**

1. **Initialize bebop:**
   ```bash
   bebop init
   ```

2. **Check registry location:**
   ```bash
   ls -la ~/.bebop/
   ```

3. **Manually create registry:**
   ```bash
   mkdir -p ~/.bebop/{packs,plans,sessions,projects}
   ```

### Issue: Config not being applied

**Diagnosis:**
```bash
# View current config
bebop config get

# Check config file exists
cat ~/.bebop/config.toml
```

**Solutions:**

1. **Reset config:**
   ```bash
   rm ~/.bebop/config.toml
   bebop init
   ```

2. **Validate config syntax:**
   ```bash
   # Check TOML syntax
   # Ensure keys are quoted if they contain special characters
   ```

3. **Check for multiple config files:**
   ```bash
   # Bebop looks for config in:
   # 1. ~/.bebop/config.toml
   # 2. .bebop/config.toml (project-specific)
   # 3. BEBOP_CONFIG environment variable
   ```

## Pack Issues

### Issue: "Pack not found"

**Error:**
```
Error [PACK_NOT_FOUND]: Pack not found: core/security@v1
```

**Solutions:**

1. **List available packs:**
   ```bash
   bebop pack list
   ```

2. **Create the pack:**
   ```bash
   bebop pack create --name core/security@v1
   # Edit the created file
   vim ~/.bebop/packs/core-security@v1.md
   ```

3. **Check pack ID format:**
   ```bash
   # Correct: namespace/pack-name@version
   # Wrong: pack-name (missing namespace/version)
   # Wrong: namespace/pack-name (missing version)
   ```

### Issue: Pack compilation fails

**Error:**
```
Error [INVALID_PACK_SYNTAX]: Invalid pack syntax: YAML parse error
```

**Solutions:**

1. **Validate YAML syntax:**
   ```bash
   # Use online validator: https://www.yamllint.com/
   # Or use CLI tool:
   yamllint ~/.bebop/packs/core-security@v1.md
   ```

2. **Check pack structure:**
   ```yaml
   id: namespace/pack-name  # Required
   version: 1               # Required
   rules:                    # Required
     - id: RULE_ID          # Required
       text: "Rule text"    # Required
       applies_when: {}     # Optional
       enforce: {}          # Optional
   ```

3. **Use dry-run:**
   ```bash
   bebop pack compile core/security@v1 --dry-run
   ```

### Issue: Pack rules not being applied

**Diagnosis:**
```bash
# Use dry-run to see what's happening
bebop chat --dry-run &use core/security Create an endpoint

# Check pack applicability
bebop pack show core/security
```

**Solutions:**

1. **Check `applies_when` conditions:**
   ```yaml
   # Make sure conditions match your context
   applies_when:
     paths: ["services/**"]    # Are you in services/?
     languages: ["typescript"] # Are you working with TS?
     any: true                  # Set to true if should always apply
   ```

2. **Force enable rules:**
   ```bash
   bebop chat &rules +NO_SECRETS &use core/security Create an endpoint
   ```

3. **Check working directory:**
   ```bash
   # Bebop uses current directory for path-based rules
   pwd
   # Should match your pack's path patterns
   ```

## Plan Issues

### Issue: "Plan not found"

**Error:**
```
Error [PLAN_NOT_FOUND]: Plan not found: backend/create-endpoint@v1
```

**Solutions:**

1. **List available plans:**
   ```bash
   bebop plan list
   ```

2. **Create the plan:**
   ```bash
   bebop plan create --name backend/create-endpoint@v1
   # Edit the created file
   vim ~/.bebop/plans/backend-create-endpoint@v1.md
   ```

3. **Use aliases:**
   ```bash
   # Create an alias
   bebop alias add endpoint backend/create-endpoint@v1
   
   # Use the alias
   bebop plan run endpoint route=POST:/users
   ```

### Issue: "Step out of range"

**Error:**
```
Error [STEP_OUT_OF_RANGE]: Step 5 is out of range (plan has 4 steps)
```

**Solutions:**

1. **Check plan steps:**
   ```bash
   bebop plan show backend/create-endpoint
   ```

2. **Use valid step number:**
   ```bash
   # Check total steps
   bebop plan show backend/create-endpoint | grep "Steps:"
   
   # Use valid step (1 to N)
   bebop step 2
   ```

3. **Jump to current step:**
   ```bash
   # Go to current step automatically
   bebop session continue
   ```

### Issue: Plan steps not being executed

**Diagnosis:**
```bash
# Check plan compilation
bebop plan compile backend/create-endpoint

# Check step pointer
bebop session show
```

**Solutions:**

1. **Check step pointer:**
   ```bash
   # See current step
   bebop session show | grep "Step:"
   
   # Jump to correct step
   bebop step 1
   ```

2. **Validate plan syntax:**
   ```bash
   bebop plan compile backend/create-endpoint
   ```

3. **Check variable substitution:**
   ```bash
   # Make sure required variables are provided
   bebop plan run backend/create-endpoint route=POST:/users operation_name=CreateUser
   ```

## Session Issues

### Issue: "No active session"

**Error:**
```
Error [NO_ACTIVE_SESSION]: No active session. Start one with `bebop session start` or `bebop chat`
```

**Solutions:**

1. **Start a new session:**
   ```bash
   bebop chat &use core example Create an endpoint
   # This automatically creates a session
   ```

2. **Start session explicitly:**
   ```bash
   bebop session start
   ```

3. **Resume existing session:**
   ```bash
   bebop session list
   bebop resume session_<id>
   ```

### Issue: Session not saving

**Diagnosis:**
```bash
# Check sessions directory
ls -la ~/.bebop/sessions/

# Check session file
cat ~/.bebop/sessions/session_<id>.json
```

**Solutions:**

1. **Check permissions:**
   ```bash
   # Ensure sessions directory is writable
   chmod -R u+w ~/.bebop/sessions/
   ```

2. **Check disk space:**
   ```bash
   df -h
   ```

3. **Clear old sessions:**
   ```bash
   bebop session cleanup --days 7
   ```

## LLM Integration Issues

### Issue: Prompt not being sent to LLM

**Diagnosis:**
```bash
# Use dry-run to see compiled prompt
bebop chat --dry-run &use core example Create a feature

# Check LLM provider configuration
bebop config get llm_provider
```

**Solutions:**

1. **Configure LLM provider:**
   ```bash
   bebop config set llm_provider openai
   bebop config set llm_api_key your-api-key
   ```

2. **Check LLM integration:**
   ```bash
   # Test LLM connection
   bebop chat &use core example Say hello
   ```

3. **Use compile only:**
   ```bash
   # Compile prompt without sending to LLM
   bebop compile &use core example Create a feature
   ```

### Issue: "LLM API error"

**Error:**
```
Error [LLM_API_ERROR]: LLM API error (openai): Invalid API key
```

**Solutions:**

1. **Check API key:**
   ```bash
   bebop config get llm_api_key
   
   # If not set:
   bebop config set llm_api_key your-api-key
   ```

2. **Check API key validity:**
   ```bash
   # Test with curl
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

3. **Check rate limits:**
   ```bash
   # OpenAI has rate limits
   # Check OpenAI dashboard for current usage
   ```

## Performance Issues

### Issue: Bebop is slow

**Diagnosis:**
```bash
# Use --verbose flag
bebop chat --verbose &use core example Create a feature

# Check stats
bebop stats
```

**Solutions:**

1. **Reduce pack size:**
   ```bash
   # Remove unused rules
   vim ~/.bebop/packs/core-example@v1.md
   
   # Or create smaller, focused packs
   bebop pack create --name my-project/minimal
   ```

2. **Use selective packs:**
   ```bash
   # Only load what you need
   bebop chat &use core/security &use my-project/nesting Create a feature
   ```

3. **Clear cache:**
   ```bash
   bebop cleanup --days 0
   ```

### Issue: Token usage still high

**Diagnosis:**
```bash
# Check compiled prompt size
bebop chat --dry-run &use core example Create a feature

# Check stats
bebop stats
```

**Solutions:**

1. **Review active constraints:**
   ```bash
   # See what's being sent
   bebop chat --dry-run &use core example Create a feature
   
   # Reduce constraints if needed
   bebop chat &use core/example Create a feature  # Minimal pack
   ```

2. **Use plan steps:**
   ```bash
   # Only send current step, not full documentation
   bebop plan run backend/create-endpoint route=POST:/users
   ```

3. **Check for redundant rules:**
   ```bash
   bebop pack show core/example | grep "rules"
   ```

## File System Issues

### Issue: "File not found"

**Error:**
```
Error [FILE_NOT_FOUND]: File not found: ~/.bebop/config.toml
```

**Solutions:**

1. **Reinitialize:**
   ```bash
   rm -rf ~/.bebop
   bebop init
   ```

2. **Create file manually:**
   ```bash
   mkdir -p ~/.bebop
   cat > ~/.bebop/config.toml << 'EOF'
   [general]
   default_editor = "cursor"
   EOF
   ```

### Issue: "Permission denied"

**Error:**
```
Error: Permission denied when writing to ~/.bebop/sessions/
```

**Solutions:**

1. **Fix permissions:**
   ```bash
   chmod -R u+w ~/.bebop/
   ```

2. **Change ownership:**
   ```bash
   sudo chown -R $USER:$USER ~/.bebop/
   ```

3. **Reinitialize:**
   ```bash
   sudo rm -rf ~/.bebop
   bebop init
   ```

## Debug Mode

When troubleshooting, enable debug mode:

```bash
# Global debug mode
export DEBUG=bebop:*
bebop chat &use core example Create a feature

# Per-command debug mode
bebop chat --debug &use core example Create a feature

# Verbose mode
bebop chat --verbose &use core example Create a feature
```

## Getting Help

If you can't resolve your issue:

1. **Check logs:**
   ```bash
   # Bebop logs
   tail -f ~/.bebop/logs/bebop.log
   
   # Or with debug mode
   bebop chat --debug 2>&1 | tee debug.log
   ```

2. **Report issues:**
   ```bash
   # Include system info
   bebop --version
   node --version
   npm --version
   
   # Include error output
   bebop chat --debug 2>&1 | tee debug.log
   
   # Report at: https://github.com/bebop/cli/issues
   ```

3. **Get support:**
   - Discord: https://discord.gg/bebop
   - Email: support@bebop.dev
   - Documentation: https://docs.bebop.dev
