# Project Structure

## Root Level
- `package.json` - npm package configuration and scripts
- `mise.toml` - mise task definitions for project automation
- `deno.json` - Deno configuration and tasks (in mcp-server/)
- `README.md` - Main documentation
- `CLAUDE.md` - Claude-specific documentation
- `LICENSE` - MIT license
- `CODEOWNERS` - GitHub code ownership
- `*.sh` - Shell scripts for installation and execution

## Core Implementation (`mcp-server/`)
- `main.ts` - Entry point, instantiates MiseMCPServer
- `mcp_server_sdk.ts` - Main MCP server implementation using SDK
- `mcp_server.ts` - Core server logic and interfaces
- `mcp_server_sdk_test.ts` - SDK implementation tests
- `mcp_server_test.ts` - Core server tests
- `mcp_protocol_test.ts` - Protocol-level tests
- `debug-server.js` - Debug utilities
- `wrapper.js` - Node.js wrapper for npm execution

## Build Artifacts (`mcp-server/bin/`)
- Cross-platform compiled binaries
- Generated during build process
- Self-contained executables

## Configuration Files
- `.gitignore` - Git ignore patterns
- `deno.json` - Deno tasks, dependencies, and compilation targets
- `deno.lock` - Deno dependency lock file

## Architecture Patterns
- **Single responsibility**: Each TypeScript file has a focused purpose
- **SDK-based**: Uses official MCP SDK for protocol implementation
- **Interface-driven**: Clear TypeScript interfaces for data structures
- **Test co-location**: Test files alongside implementation files
- **Binary distribution**: Compiles to standalone executables

## File Naming Conventions
- `*_test.ts` - Test files
- `*.ts` - TypeScript source files
- `*.js` - JavaScript wrapper/utility files
- Snake_case for multi-word filenames