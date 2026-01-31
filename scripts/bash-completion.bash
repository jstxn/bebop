# Bash completion for bebop
# Install: source this file from ~/.bashrc (or add to /etc/bash_completion.d/bebop)

_bebop_completion() {
    local cur prev words cword
    _init_completion || return

    # Global flags
    if [[ ${cur} == -* ]]; then
        COMPREPLY=($(compgen -W "--help --version" -- "${cur}"))
        return
    fi

    # Top-level commands
    if [[ ${cword} -eq 1 ]]; then
        COMPREPLY=($(compgen -W "
            detect-context
            init
            select-packs
            pack
            hook
            compile
            compile-auto
            stats
        " -- "${cur}"))
        return
    fi

    case ${words[1]} in
        init)
            COMPREPLY=($(compgen -W "--auto --registry --no-aliases --no-hooks --no-plugins" -- "${cur}"))
            ;;
        detect-context)
            COMPREPLY=($(compgen -W "--cwd --input --json" -- "${cur}"))
            ;;
        select-packs)
            COMPREPLY=($(compgen -W "--context --input --cwd --json --verbose" -- "${cur}"))
            ;;
        pack)
            if [[ ${cword} -eq 2 ]]; then
                COMPREPLY=($(compgen -W "list show import" -- "${cur}"))
            elif [[ ${cword} -eq 3 ]]; then
                case ${words[2]} in
                    show)
                        _bebop_complete_packs "${cur}"
                        ;;
                    import)
                        _bebop_complete_files "${cur}"
                        ;;
                esac
            fi
            ;;
        hook)
            if [[ ${cword} -eq 2 ]]; then
                COMPREPLY=($(compgen -W "compile session-start session-end" -- "${cur}"))
            else
                case ${words[2]} in
                    compile)
                        _bebop_complete_directives "${cur}"
                        ;;
                    session-start|session-end)
                        COMPREPLY=($(compgen -W "--tool" -- "${cur}"))
                        ;;
                esac
            fi
            ;;
        compile|compile-auto)
            if [[ ${cur} == \&* ]]; then
                _bebop_complete_directives "${cur}"
            else
                COMPREPLY=($(compgen -W "--json --auto --no-enforce --tool --context --cwd --input --packs" -- "${cur}"))
            fi
            ;;
        stats)
            COMPREPLY=($(compgen -W "--json --tool --session --since" -- "${cur}"))
            ;;
    esac
}

_bebop_complete_directives() {
    local cur=$1
    COMPREPLY=($(compgen -W "&use &pack" -- "${cur}"))
}

_bebop_complete_packs() {
    local cur=$1
    COMPREPLY=($(compgen -W "core/security@v1 core/code-quality@v1" -- "${cur}"))
}

_bebop_complete_files() {
    local cur=$1
    COMPREPLY=($(compgen -f -X "!@(*.md|*.yaml|*.yml)" -- "${cur}"))
}

complete -F _bebop_completion bebop
