#compdef bebop

_bebop() {
    local -a commands
    commands=(
        'detect-context:Detect repo/project context'
        'init:Initialize Bebop registry (and optional auto integration)'
        'select-packs:Show which packs Bebop would select'
        'pack:Manage packs (list/show/import)'
        'hook:Hook helpers for tool integrations'
        'compile:Compile a prompt with packs/constraints'
        'compile-auto:Compile a prompt with auto-selected packs'
        'stats:Show usage statistics'
    )

    if (( CURRENT == 2 )); then
        _describe -t commands 'bebop commands' commands
        return
    fi

    case $words[2] in
        init)
            _arguments \
                '--auto[Install automatic integration (hooks/plugins/aliases)]' \
                '--registry[Registry path]:path:_files' \
                '--no-aliases[Skip shell alias installation]' \
                '--no-hooks[Skip hook installation]' \
                '--no-plugins[Skip plugin installation]'
            ;;
        detect-context)
            _arguments \
                '--cwd[Working directory]:path:_files' \
                '--input[User input]:text:' \
                '--json[Output JSON]'
            ;;
        select-packs)
            _arguments \
                '--context[Context JSON]:json:' \
                '--input[User input]:text:' \
                '--cwd[Working directory]:path:_files' \
                '--json[Output JSON]' \
                '--verbose[Include selection reasons]'
            ;;
        pack)
            local -a subcommands
            subcommands=(
                'list:List available packs'
                'show:Show a pack'
                'import:Import a pack file into the registry'
            )
            if (( CURRENT == 3 )); then
                _describe -t pack-commands 'pack commands' subcommands
                return
            fi
            case $words[3] in
                show)
                    _values 'packs' 'core/security@v1' 'core/code-quality@v1'
                    ;;
                import)
                    _arguments '1:file:_files'
                    ;;
            esac
            ;;
        hook)
            local -a subcommands
            subcommands=(
                'compile:Compile prompt for hooks'
                'session-start:Start a tracked session'
                'session-end:End a tracked session'
            )
            if (( CURRENT == 3 )); then
                _describe -t hook-commands 'hook commands' subcommands
                return
            fi
            case $words[3] in
                compile)
                    _values -s ' ' 'directives' '&use' '&pack'
                    ;;
                session-start|session-end)
                    _arguments '--tool[Tool name]:name:'
                    ;;
            esac
            ;;
        compile|compile-auto)
            _values -s ' ' 'directives' '&use' '&pack'
            ;;
        stats)
            _arguments \
                '--json[Output JSON]' \
                '--tool[Filter by tool]:name:' \
                '--session[Summarize current session only]' \
                '--since[Filter records since ISO timestamp]:iso:'
            ;;
    esac
}

_bebop "$@"
