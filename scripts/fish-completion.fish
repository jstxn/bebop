# Fish completion for bebop

complete -c bebop -f

# Global options
complete -c bebop -l help -d 'Show help'
complete -c bebop -l version -d 'Show version'

# Top-level commands
complete -c bebop -n "__fish_use_subcommand" -a detect-context -d 'Detect repo/project context'
complete -c bebop -n "__fish_use_subcommand" -a init -d 'Initialize Bebop registry (and optional auto integration)'
complete -c bebop -n "__fish_use_subcommand" -a select-packs -d 'Show which packs Bebop would select'
complete -c bebop -n "__fish_use_subcommand" -a pack -d 'Manage packs (list/show/import)'
complete -c bebop -n "__fish_use_subcommand" -a hook -d 'Hook helpers for tool integrations'
complete -c bebop -n "__fish_use_subcommand" -a compile -d 'Compile a prompt with packs/constraints'
complete -c bebop -n "__fish_use_subcommand" -a compile-auto -d 'Compile a prompt with auto-selected packs'
complete -c bebop -n "__fish_use_subcommand" -a stats -d 'Show usage statistics'

# init
complete -c bebop -n "__fish_seen_subcommand_from init" -l auto -d 'Install automatic integration (hooks/plugins/aliases)'
complete -c bebop -n "__fish_seen_subcommand_from init" -l registry -d 'Registry path' -r -F
complete -c bebop -n "__fish_seen_subcommand_from init" -l no-aliases -d 'Skip shell alias installation'
complete -c bebop -n "__fish_seen_subcommand_from init" -l no-hooks -d 'Skip hook installation'
complete -c bebop -n "__fish_seen_subcommand_from init" -l no-plugins -d 'Skip plugin installation'

# detect-context
complete -c bebop -n "__fish_seen_subcommand_from detect-context" -l cwd -d 'Working directory' -r -F
complete -c bebop -n "__fish_seen_subcommand_from detect-context" -l input -d 'User input' -r
complete -c bebop -n "__fish_seen_subcommand_from detect-context" -l json -d 'Output JSON'

# select-packs
complete -c bebop -n "__fish_seen_subcommand_from select-packs" -l context -d 'Context JSON' -r
complete -c bebop -n "__fish_seen_subcommand_from select-packs" -l input -d 'User input' -r
complete -c bebop -n "__fish_seen_subcommand_from select-packs" -l cwd -d 'Working directory' -r -F
complete -c bebop -n "__fish_seen_subcommand_from select-packs" -l json -d 'Output JSON'
complete -c bebop -n "__fish_seen_subcommand_from select-packs" -l verbose -d 'Include selection reasons'

# pack
complete -c bebop -n "__fish_seen_subcommand_from pack; and __fish_use_subcommand" -a list -d 'List available packs'
complete -c bebop -n "__fish_seen_subcommand_from pack; and __fish_use_subcommand" -a show -d 'Show pack details'
complete -c bebop -n "__fish_seen_subcommand_from pack; and __fish_use_subcommand" -a import -d 'Import a pack file'

complete -c bebop -n "__fish_seen_subcommand_from pack show" -a 'core/security@v1 core/code-quality@v1'
complete -c bebop -n "__fish_seen_subcommand_from pack import" -r -F

# hook
complete -c bebop -n "__fish_seen_subcommand_from hook; and __fish_use_subcommand" -a compile -d 'Compile prompt for hooks'
complete -c bebop -n "__fish_seen_subcommand_from hook; and __fish_use_subcommand" -a session-start -d 'Start a tracked session'
complete -c bebop -n "__fish_seen_subcommand_from hook; and __fish_use_subcommand" -a session-end -d 'End a tracked session'

complete -c bebop -n "__fish_seen_subcommand_from hook session-start" -l tool -d 'Tool name' -r
complete -c bebop -n "__fish_seen_subcommand_from hook session-end" -l tool -d 'Tool name' -r

# compile / compile-auto
complete -c bebop -n "__fish_seen_subcommand_from compile" -a '&use' -d 'Include packs'
complete -c bebop -n "__fish_seen_subcommand_from compile" -a '&pack' -d 'Include pack by ID'
complete -c bebop -n "__fish_seen_subcommand_from compile-auto" -a '&use' -d 'Include packs'
complete -c bebop -n "__fish_seen_subcommand_from compile-auto" -a '&pack' -d 'Include pack by ID'

# stats
complete -c bebop -n "__fish_seen_subcommand_from stats" -l json -d 'Output JSON'
complete -c bebop -n "__fish_seen_subcommand_from stats" -l tool -d 'Filter by tool' -r
complete -c bebop -n "__fish_seen_subcommand_from stats" -l session -d 'Summarize current session only'
complete -c bebop -n "__fish_seen_subcommand_from stats" -l since -d 'Filter records since ISO timestamp' -r
