#!/bin/bash

# mise MCP Server installer and runner
# Downloads the latest release and executes it

set -e

REPO="RyosukeDTomita/mise-mcp-server"
INSTALL_DIR="$HOME/.local/bin"
BINARY_NAME="mise-mcp-server"

# Detect platform and architecture
get_platform() {
    local os=$(uname -s | tr '[:upper:]' '[:lower:]')
    local arch=$(uname -m)
    
    case "$os" in
        linux*)
            case "$arch" in
                x86_64) echo "linux-x64" ;;
                *) echo "unsupported" ;;
            esac
            ;;
        darwin*)
            case "$arch" in
                x86_64) echo "darwin-x64" ;;
                arm64) echo "darwin-arm64" ;;
                *) echo "unsupported" ;;
            esac
            ;;
        mingw*|msys*|cygwin*)
            case "$arch" in
                x86_64) echo "windows-x64" ;;
                *) echo "unsupported" ;;
            esac
            ;;
        *)
            echo "unsupported"
            ;;
    esac
}

# Get latest release download URL
get_latest_release_url() {
    local platform="$1"
    local binary_suffix=""
    
    if [[ "$platform" == *"windows"* ]]; then
        binary_suffix=".exe"
    fi
    
    local binary_name="mise-mcp-server-${platform}${binary_suffix}"
    
    # Get latest release info from GitHub API
    local release_url="https://api.github.com/repos/$REPO/releases/latest"
    local download_url
    
    if command -v curl >/dev/null 2>&1; then
        download_url=$(curl -s "$release_url" | grep "browser_download_url.*$binary_name" | cut -d '"' -f 4)
    elif command -v wget >/dev/null 2>&1; then
        download_url=$(wget -qO- "$release_url" | grep "browser_download_url.*$binary_name" | cut -d '"' -f 4)
    else
        echo "Error: curl or wget is required" >&2
        exit 1
    fi
    
    if [ -z "$download_url" ]; then
        echo "Error: Could not find download URL for platform: $platform" >&2
        exit 1
    fi
    
    echo "$download_url"
}

# Download and install binary
install_binary() {
    local platform="$1"
    local download_url="$2"
    local binary_suffix=""
    
    if [[ "$platform" == *"windows"* ]]; then
        binary_suffix=".exe"
    fi
    
    local binary_path="$INSTALL_DIR/${BINARY_NAME}${binary_suffix}"
    
    # Create install directory
    mkdir -p "$INSTALL_DIR"
    
    echo "Downloading from: $download_url" >&2
    echo "Installing to: $binary_path" >&2
    
    # Download binary
    if command -v curl >/dev/null 2>&1; then
        curl -L "$download_url" -o "$binary_path"
    elif command -v wget >/dev/null 2>&1; then
        wget "$download_url" -O "$binary_path"
    fi
    
    # Make executable
    chmod +x "$binary_path"
    
    echo "$binary_path"
}

# Check if binary exists and is recent
check_existing_binary() {
    local platform="$1"
    local binary_suffix=""
    
    if [[ "$platform" == *"windows"* ]]; then
        binary_suffix=".exe"
    fi
    
    local binary_path="$INSTALL_DIR/${BINARY_NAME}${binary_suffix}"
    
    if [ -x "$binary_path" ]; then
        # Check if binary is less than 24 hours old
        if [ -n "$(find "$binary_path" -mtime -1 2>/dev/null)" ]; then
            echo "$binary_path"
            return 0
        fi
    fi
    
    return 1
}

main() {
    # Detect platform
    local platform=$(get_platform)
    if [ "$platform" = "unsupported" ]; then
        echo "Error: Unsupported platform $(uname -s)/$(uname -m)" >&2
        exit 1
    fi
    
    # Check for existing binary
    local binary_path
    if binary_path=$(check_existing_binary "$platform"); then
        echo "Using existing binary: $binary_path" >&2
    else
        # Download and install
        echo "Installing mise MCP server for $platform..." >&2
        local download_url=$(get_latest_release_url "$platform")
        binary_path=$(install_binary "$platform" "$download_url")
        echo "Installation complete: $binary_path" >&2
    fi
    
    # Execute the binary
    exec "$binary_path" "$@"
}

# Run main function
main "$@"