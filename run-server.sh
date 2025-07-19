#!/bin/bash

# MCP Server runner for Claude Desktop
# Downloads and executes the latest mise MCP server from GitHub

GITHUB_RAW_URL="https://raw.githubusercontent.com/RyosukeDTomita/mise-mcp-server/main/mcp-server/standalone.js"
TEMP_FILE="/tmp/mise-mcp-server-$$.js"

# Check if mise is installed
if ! command -v mise &> /dev/null; then
    echo '{"jsonrpc":"2.0","id":null,"error":{"code":-32603,"message":"mise command not found. Please install mise first: https://mise.jdx.dev/"}}' >&2
    exit 1
fi

# Download the server script
if command -v curl &> /dev/null; then
    curl -s "$GITHUB_RAW_URL" -o "$TEMP_FILE"
elif command -v wget &> /dev/null; then
    wget -q "$GITHUB_RAW_URL" -O "$TEMP_FILE"
else
    echo '{"jsonrpc":"2.0","id":null,"error":{"code":-32603,"message":"curl or wget required to download server"}}' >&2
    exit 1
fi

# Check if download was successful
if [ ! -f "$TEMP_FILE" ] || [ ! -s "$TEMP_FILE" ]; then
    echo '{"jsonrpc":"2.0","id":null,"error":{"code":-32603,"message":"Failed to download server script"}}' >&2
    exit 1
fi

# Execute the server
trap "rm -f '$TEMP_FILE'" EXIT
node "$TEMP_FILE" "$@"