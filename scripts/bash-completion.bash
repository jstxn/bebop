# Bash completion for bebop
# Install: source this file in your .bashrc or add to /etc/bash_completion.d/bebop

_bebop_completion() {
    local cur prev words cword
    _init_completion || return

    # Handle --help and --version
    if [[ ${cur} == -* ]]; then
        COMPREPLY=($(compgen -W "--help --version --debug --verbose" -- "${cur}"))
        return
    fi

    # Top-level commands
    if [[ ${cword} -eq 1 ]]; then
        COMPREPLY=($(compgen -W "
            init
            chat
            compile
            session
            pack
            plan
            config
            alias
            stats
            update
            cleanup
            help
        " -- "${cur}"))
        return
    fi

    # Sub-commands
    case ${prev} in
        init)
            COMPREPLY=($(compgen -W "--project --import" -- "${cur}"))
            ;;
        chat)
            if [[ ${cword} -eq 2 ]]; then
                COMPREPLY=($(compgen -W "--dry-run --verbose" -- "${cur}"))
            else
                _bebop_complete_directives "${cur}"
            fi
            ;;
        compile)
            _bebop_complete_directives "${cur}"
            ;;
        session)
            if [[ ${cword} -eq 2 ]]; then
                COMPREPLY=($(compgen -W "
                    start
                    continue
                    show
                    list
                    end
                    resume
                    step
                    cleanup
                " -- "${cur}"))
            elif [[ ${cword} -eq 3 ]]; then
                case ${words[2]} in
                    step|resume)
                        _bebop_complete_sessions "${cur}"
                        ;;
                    cleanup)
                        COMPREPLY=($(compgen -W "--days" -- "${cur}"))
                        ;;
                esac
            fi
            ;;
        pack)
            if [[ ${cword} -eq 2 ]]; then
                COMPREPLY=($(compgen -W "
                    list
                    show
                    create
                    compile
                    test
                    import
                " -- "${cur}"))
            elif [[ ${cword} -eq 3 ]]; then
                case ${words[2]} in
                    show|compile|test)
                        _bebop_complete_packs "${cur}"
                        ;;
                    create)
                        COMPREPLY=($(compgen -W "--name" -- "${cur}"))
                        ;;
                    import)
                        _bebop_complete_files "${cur}"
                        ;;
                esac
            fi
            ;;
        plan)
            if [[ ${cword} -eq 2 ]]; then
                COMPREPLY=($(compgen -W "
                    list
                    show
                    create
                    compile
                    run
                " -- "${cur}"))
            elif [[ ${cword} -eq 3 ]]; then
                case ${words[2]} in
                    show|compile|run)
                        _bebop_complete_plans "${cur}"
                        ;;
                    create)
                        COMPREPLY=($(compgen -W "--name" -- "${cur}"))
                        ;;
                esac
            fi
            ;;
        config)
            if [[ ${cword} -eq 2 ]]; then
                COMPREPLY=($(compgen -W "get set" -- "${cur}"))
            elif [[ ${cword} -eq 3 ]]; then
                _bebop_complete_config_keys "${cur}"
            fi
            ;;
        alias)
            if [[ ${cword} -eq 2 ]]; then
                COMPREPLY=($(compgen -W "list add remove" -- "${cur}"))
            fi
            ;;
        cleanup)
            COMPREPLY=($(compgen -W "--dry-run --force" -- "${cur}"))
            ;;
        update)
            COMPREPLY=($(compgen -W "--check" -- "${cur}"))
            ;;
    esac
}

_bebop_complete_directives() {
    local cur=$1
    COMPREPLY=($(compgen -W "&use &pack &plan &svc &step &rules &dry-run" -- "${cur}"))
}

_bebop_complete_sessions() {
    local cur=$1
    # This would query bebop for available sessions
    # For now, provide a placeholder
    COMPREPLY=($(compgen -W "session_latest" -- "${cur}"))
}

_bebop_complete_packs() {
    local cur=$1
    # This would query bebop for available packs
    # For now, provide examples
    COMPREPLY=($(compgen -W "core/example@v1 core/nestjs@v1" -- "${cur}"))
}

_bebop_complete_plans() {
    local cur=$1
    # This would query bebop for available plans
    # For now, provide examples
    COMPREPLY=($(compgen -W "core/simple-task@v1 core/create-endpoint@v1" -- "${cur}"))
}

_bebop_complete_config_keys() {
    local cur=$1
    COMPREPLY=($(compgen -W "
        default_editor
        llm_provider
        llm_api_key
        max_tokens_per_session
        auto_cleanup_days
    " -- "${cur}"))
}

_bebop_complete_files() {
    local cur=$1
    COMPREPLY=($(compgen -f -X "!@(*.md|*.txt)" -- "${cur}"))
}

complete -F _bebop_completion bebop
