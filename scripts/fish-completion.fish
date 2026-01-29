# Fish completion for bebop

complete -c bebop -f

# Global options
complete -c bebop -l help -d 'Show help'
complete -c bebop -l version -d 'Show version'
complete -c bebop -l debug -d 'Enable debug mode'
complete -c bebop -l verbose -d 'Enable verbose output'

# Top-level commands
complete -c bebop -n "__fish_use_subcommand" -a init -d 'Initialize bebop registry'
complete -c bebop -n "__fish_use_subcommand" -a chat -d 'Send input to LLM with bebop compilation'
complete -c bebop -n "__fish_use_subcommand" -a compile -d 'Compile input to prompt (no LLM)'
complete -c bebop -n "__fish_use_subcommand" -a session -d 'Manage sessions'
complete -c bebop -n "__fish_use_subcommand" -a pack -d 'Manage packs'
complete -c bebop -n "__fish_use_subcommand" -a plan -d 'Manage plans'
complete -c bebop -n "__fish_use_subcommand" -a config -d 'Manage configuration'
complete -c bebop -n "__fish_use_subcommand" -a alias -d 'Manage aliases'
complete -c bebop -n "__fish_use_subcommand" -a stats -d 'Show usage statistics'
complete -c bebop -n "__fish_use_subcommand" -a update -d 'Update bebop'
complete -c bebop -n "__fish_use_subcommand" -a cleanup -d 'Clean up old data'
complete -c bebop -n "__fish_use_subcommand" -a help -d 'Show help'

# init command
complete -c bebop -n "__fish_seen_subcommand_from init" -l project -d 'Create project namespace'
complete -c bebop -n "__fish_seen_subcommand_from init" -l import -d 'Import existing docs' -r -F

# chat command
complete -c bebop -n "__fish_seen_subcommand_from chat" -l dry-run -d 'Show compiled prompt without sending'
complete -c bebop -n "__fish_seen_subcommand_from chat" -l verbose -d 'Show verbose output'
complete -c bebop -n "__fish_seen_subcommand_from chat" -a '&use' -d 'Use pack by alias'
complete -c bebop -n "__fish_seen_subcommand_from chat" -a '&pack' -d 'Load pack by ID'
complete -c bebop -n "__fish_seen_subcommand_from chat" -a '&plan' -d 'Load plan by ID'
complete -c bebop -n "__fish_seen_subcommand_from chat" -a '&svc' -d 'Specify service context'
complete -c bebop -n "__fish_seen_subcommand_from chat" -a '&step' -d 'Jump to step'
complete -c bebop -n "__fish_seen_subcommand_from chat" -a '&rules' -d 'Override rules'
complete -c bebop -n "__fish_seen_subcommand_from chat" -a '&dry-run' -d 'Dry run mode'

# compile command
complete -c bebop -n "__fish_seen_subcommand_from compile" -a '&use' -d 'Use pack by alias'
complete -c bebop -n "__fish_seen_subcommand_from compile" -a '&pack' -d 'Load pack by ID'
complete -c bebop -n "__fish_seen_subcommand_from compile" -a '&plan' -d 'Load plan by ID'
complete -c bebop -n "__fish_seen_subcommand_from compile" -a '&svc' -d 'Specify service context'
complete -c bebop -n "__fish_seen_subcommand_from compile" -a '&step' -d 'Jump to step'
complete -c bebop -n "__fish_seen_subcommand_from compile" -a '&rules' -d 'Override rules'

# session command
complete -c bebop -n "__fish_seen_subcommand_from session; and __fish_use_subcommand" -a start -d 'Start a new session'
complete -c bebop -n "__fish_seen_subcommand_from session; and __fish_use_subcommand" -a continue -d 'Continue active session'
complete -c bebop -n "__fish_seen_subcommand_from session; and __fish_use_subcommand" -a show -d 'Show current session details'
complete -c bebop -n "__fish_seen_subcommand_from session; and __fish_use_subcommand" -a list -d 'List all sessions'
complete -c bebop -n "__fish_seen_subcommand_from session; and __fish_use_subcommand" -a end -d 'End current session'
complete -c bebop -n "__fish_seen_subcommand_from session; and __fish_use_subcommand" -a resume -d 'Resume a specific session'
complete -c bebop -n "__fish_seen_subcommand_from session; and __fish_use_subcommand" -a step -d 'Jump to a specific step'
complete -c bebop -n "__fish_seen_subcommand_from session; and __fish_use_subcommand" -a cleanup -d 'Clean up old sessions'

# session step command
complete -c bebop -n "__fish_seen_subcommand_from session step" -a (string match 'session_*' (ls ~/.bebop/sessions 2>/dev/null | string replace '.json' ''))

# session resume command
complete -c bebop -n "__fish_seen_subcommand_from session resume" -a (string match 'session_*' (ls ~/.bebop/sessions 2>/dev/null | string replace '.json' ''))

# session cleanup command
complete -c bebop -n "__fish_seen_subcommand_from session cleanup" -l days -d 'Age in days'

# pack command
complete -c bebop -n "__fish_seen_subcommand_from pack; and __fish_use_subcommand" -a list -d 'List all packs'
complete -c bebop -n "__fish_seen_subcommand_from pack; and __fish_use_subcommand" -a show -d 'Show pack details'
complete -c bebop -n "__fish_seen_subcommand_from pack; and __fish_use_subcommand" -a create -d 'Create new pack'
complete -c bebop -n "__fish_seen_subcommand_from pack; and __fish_use_subcommand" -a compile -d 'Compile pack'
complete -c bebop -n "__fish_seen_subcommand_from pack; and __fish_use_subcommand" -a test -d 'Test pack rules'
complete -c bebop -n "__fish_seen_subcommand_from pack; and __fish_use_subcommand" -a import -d 'Import docs as pack'

# pack create command
complete -c bebop -n "__fish_seen_subcommand_from pack create" -l name -d 'Pack name'

# pack import command
complete -c bebop -n "__fish_seen_subcommand_from pack import" -r -F

# pack show/compile/test commands
complete -c bebop -n "__fish_seen_subcommand_from pack show" -a (ls ~/.bebop/packs 2>/dev/null | string replace '@*.md' '')
complete -c bebop -n "__fish_seen_subcommand_from pack compile" -a (ls ~/.bebop/packs 2>/dev/null | string replace '@*.md' '')
complete -c bebop -n "__fish_seen_subcommand_from pack test" -a (ls ~/.bebop/packs 2>/dev/null | string replace '@*.md' '')

# plan command
complete -c bebop -n "__fish_seen_subcommand_from plan; and __fish_use_subcommand" -a list -d 'List all plans'
complete -c bebop -n "__fish_seen_subcommand_from plan; and __fish_use_subcommand" -a show -d 'Show plan details'
complete -c bebop -n "__fish_seen_subcommand_from plan; and __fish_use_subcommand" -a create -d 'Create new plan'
complete -c bebop -n "__fish_seen_subcommand_from plan; and __fish_use_subcommand" -a compile -d 'Compile plan'
complete -c bebop -n "__fish_seen_subcommand_from plan; and __fish_use_subcommand" -a run -d 'Run a plan'

# plan create command
complete -c bebop -n "__fish_seen_subcommand_from plan create" -l name -d 'Plan name'

# plan show/compile/run commands
complete -c bebop -n "__fish_seen_subcommand_from plan show" -a (ls ~/.bebop/plans 2>/dev/null | string replace '@*.md' '')
complete -c bebop -n "__fish_seen_subcommand_from plan compile" -a (ls ~/.bebop/plans 2>/dev/null | string replace '@*.md' '')
complete -c bebop -n "__fish_seen_subcommand_from plan run" -a (ls ~/.bebop/plans 2>/dev/null | string replace '@*.md' '')

# config command
complete -c bebop -n "__fish_seen_subcommand_from config; and __fish_use_subcommand" -a get -d 'Get config value'
complete -c bebop -n "__fish_seen_subcommand_from config; and __fish_use_subcommand" -a set -d 'Set config value'

# config keys
complete -c bebop -n "__fish_seen_subcommand_from config get" -a default_editor -d 'Default editor'
complete -c bebop -n "__fish_seen_subcommand_from config get" -a llm_provider -d 'LLM provider'
complete -c bebop -n "__fish_seen_subcommand_from config get" -a llm_api_key -d 'LLM API key'
complete -c bebop -n "__fish_seen_subcommand_from config get" -a max_tokens_per_session -d 'Max tokens per session'
complete -c bebop -n "__fish_seen_subcommand_from config get" -a auto_cleanup_days -d 'Auto cleanup days'

complete -c bebop -n "__fish_seen_subcommand_from config set" -a default_editor -d 'Default editor'
complete -c bebop -n "__fish_seen_subcommand_from config set" -a llm_provider -d 'LLM provider'
complete -c bebop -n "__fish_seen_subcommand_from config set" -a llm_api_key -d 'LLM API key'
complete -c bebop -n "__fish_seen_subcommand_from config set" -a max_tokens_per_session -d 'Max tokens per session'
complete -c bebop -n "__fish_seen_subcommand_from config set" -a auto_cleanup_days -d 'Auto cleanup days'

# alias command
complete -c bebop -n "__fish_seen_subcommand_from alias; and __fish_use_subcommand" -a list -d 'List all aliases'
complete -c bebop -n "__fish_seen_subcommand_from alias; and __fish_use_subcommand" -a add -d 'Add an alias'
complete -c bebop -n "__fish_seen_subcommand_from alias; and __fish_use_subcommand" -a remove -d 'Remove an alias'

# cleanup command
complete -c bebop -n "__fish_seen_subcommand_from cleanup" -l dry-run -d 'Show what would be cleaned'
complete -c bebop -n "__fish_seen_subcommand_from cleanup" -l force -d 'Clean without confirmation'

# update command
complete -c bebop -n "__fish_seen_subcommand_from update" -l check -d 'Check for updates only'
