#!/bin/bash

# Quick runner for mise MCP server
# One-liner friendly version

REPO="RyosukeDTomita/mise-mcp-server"
CACHE_DIR="$HOME/.cache/mise-mcp-server"
BINARY_NAME="mise-mcp-server"

# Detect platform
get_platform() {
    case "$(uname -s)" in
        Linux) echo "linux-x64" ;;
        Darwin) 
            case "$(uname -m)" in
                arm64) echo "darwin-arm64" ;;
                x86_64) echo "darwin-x64" ;;
                *) echo "darwin-x64" ;;
            esac
            ;;
        MINGW*|MSYS*|CYGWIN*) echo "windows-x64" ;;
        *) echo "linux-x64" ;;
    esac
}

# Main execution
main() {
    local platform=$(get_platform)
    local suffix=""
    [[ "$platform" == *"windows"* ]] && suffix=".exe"
    
    local binary_path="$CACHE_DIR/${BINARY_NAME}-${platform}${suffix}"
    
    # Create cache directory
    mkdir -p "$CACHE_DIR"
    
    # Download if not exists or older than 1 day
    if [ ! -x "$binary_path" ] || [ -n "$(find "$binary_path" -mtime +1 2>/dev/null)" ]; then
        echo "Downloading mise MCP server..." >&2
        
        # Get latest release URL
        local api_url="https://api.github.com/repos/$REPO/releases/latest"
        local download_url
        
        if command -v curl >/dev/null; then
            download_url=$(curl -s "$api_url" | grep "browser_download_url.*${BINARY_NAME}-${platform}${suffix}" | cut -d '"' -f 4)
            [ -n "$download_url" ] && curl -L "$download_url" -o "$binary_path"
        elif command -v wget >/dev/null; then
            download_url=$(wget -qO- "$api_url" | grep "browser_download_url.*${BINARY_NAME}-${platform}${suffix}" | cut -d '"' -f 4)
            [ -n "$download_url" ] && wget "$download_url" -O "$binary_path"
        else
            echo "Error: curl or wget required" >&2
            exit 1
        fi
        
        chmod +x "$binary_path" 2>/dev/null || true
    fi
    
    # Execute
    exec "$binary_path" "$@"
}

main "$@"