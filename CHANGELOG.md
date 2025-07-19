# Changelog

All notable changes to this project will be documented in this file.

## [v0.2.0] - 2025-07-19

### Added
- GitHub Releases automated workflow
- Cross-platform binary distribution (Linux, macOS, Windows)
- Auto-download and execute scripts (`run.sh`, `install-and-run.sh`)
- Simplified Claude Desktop integration options

### Changed
- Moved from npx distribution to GitHub Releases
- Simplified installation process
- Updated documentation with multiple installation methods

### Removed
- npx distribution method (due to compatibility issues)
- Complex Deno dependency requirements for end users

## [v0.1.0] - Initial Release

### Added
- Basic MCP server implementation for mise tasks
- Support for listing and executing mise tasks
- TDD development approach following t-wada methodology
- Deno-based implementation with TypeScript