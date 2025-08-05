# Technology Stack

## Runtime & Languages
- **Deno**: Primary runtime for TypeScript execution
- **TypeScript**: Main development language
- **Node.js**: For npm package distribution and wrapper scripts

## Key Dependencies
- `@modelcontextprotocol/sdk`: MCP protocol implementation
- `@std/toml`: TOML parsing for mise.toml files
- `@std/assert`: Testing utilities

## Build System
- **Deno tasks**: Primary build system defined in `deno.json`
- **npm scripts**: Package-level scripts in `package.json`
- **mise tasks**: Project task management in `mise.toml`

## Common Commands

### Development
```bash
# Run in development mode with watch
deno task dev

# Run tests
deno task test
deno task test:watch

# Start via npm
npm start
```

### Building
```bash
# Compile for current platform
deno task compile

# Build all platform binaries
deno task build
npm run build

# Clean build artifacts
deno task clean
npm run clean
```

### Testing
```bash
# Run Deno tests
deno task test

# Run npm test
npm test
```

## Cross-Platform Compilation
The project compiles to native binaries for:
- Linux x64
- macOS Intel (x64)
- macOS Apple Silicon (arm64)
- Windows x64

All binaries are self-contained with no external dependencies.