# mise-task-mcp-server

![mit license](https://img.shields.io/github/license/RyosukeDTomita/mise-mcp-server)

## INDEX

- [ABOUT](#about)
- [ENVIRONMENT](#environment)
- [PREPARING](#preparing)
- [HOW TO USE](#how-to-use)

---

## ABOUT

[mise](https://github.com/jdx/mise) task MCP Server.

This is an MCP (Model Context Protocol) server that allows AI assistants to interact with mise tasks. It provides tools to list and execute mise tasks from your projects.

---

## ENVIRONMENT

```shell
deno -v
deno 2.4.2
```

---

## PREPARING

### Install Deno

[Deno](https://deno.com/)

```shell
curl -fsSL https://deno.land/install.sh | sudo DENO_INSTALL=/usr/local sh
```

### Install mise

[mise](https://mise.jdx.dev/)

```shell
curl https://mise.jdx.dev/install.sh | sh
```

---

## HOW TO USE

### Running the MCP Server

#### Method 1: Auto-download and run (Recommended)

```shell
# Download and run the latest binary automatically
curl -s https://raw.githubusercontent.com/RyosukeDTomita/mise-mcp-server/main/run.sh | bash
```

#### Method 2: Manual installation

```shell
# Install to ~/.local/bin and run
curl -s https://raw.githubusercontent.com/RyosukeDTomita/mise-mcp-server/main/install-and-run.sh | bash
```

#### Method 3: Manual download from releases

1. Go to [GitHub Releases](https://github.com/RyosukeDTomita/mise-mcp-server/releases)
2. Download the binary for your platform:
   - `mise-mcp-server-linux-x64` (Linux)
   - `mise-mcp-server-darwin-x64` (macOS Intel)
   - `mise-mcp-server-darwin-arm64` (macOS Apple Silicon)
   - `mise-mcp-server-windows-x64.exe` (Windows)
3. Make it executable: `chmod +x mise-mcp-server-*`
4. Run: `./mise-mcp-server-*`

#### Method 4: Running locally with Deno

```shell
cd mcp-server
deno run --allow-run --allow-read main.ts
```

**Prerequisites**: You need `mise` installed on your system.

### Available Tools

1. **mise/listTasks**: List all available mise tasks
   - Parameters:
     - `directory` (optional): Directory to search for mise.toml

2. **mise/runTask**: Run a specific mise task
   - Parameters:
     - `task` (required): The name of the task to run
     - `args` (optional): Arguments to pass to the task

### Testing

Run all tests:

```shell
cd mcp-server
deno task test
# or manually with permissions
deno test --allow-run --allow-read
```

Run tests with watch mode:

```shell
cd mcp-server
deno task test:watch
```

**Note**: Tests require `--allow-run` and `--allow-read` permissions to execute commands and read files.

### Building

Build binaries for all supported platforms:

```shell
# From repository root
npm run build

# Or from mcp-server directory
cd mcp-server
deno task build
```

Build for specific platforms:

```shell
cd mcp-server
deno task compile:linux      # Linux x64
deno task compile:macos-intel # macOS Intel
deno task compile:macos-arm   # macOS Apple Silicon  
deno task compile:windows    # Windows x64
```

Clean build artifacts:

```shell
npm run clean
# or
cd mcp-server && deno task clean
```

### Example mise.toml

```toml
[tasks.build]
run = "deno compile main.ts"
description = "Build the project"

[tasks.test]
run = "deno test"
depends = ["build"]
description = "Run tests"

[tasks.dev]
run = "deno run --watch main.ts"
description = "Run in development mode"
```

### Integration with Claude Desktop

Add one of the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

#### Option 1: Auto-download binary (Recommended)

```json
{
  "mcpServers": {
    "mise-tasks": {
      "command": "bash",
      "args": ["-c", "curl -s https://raw.githubusercontent.com/RyosukeDTomita/mise-mcp-server/main/run.sh | bash"]
    }
  }
}
```

#### Option 2: Install and run

```json
{
  "mcpServers": {
    "mise-tasks": {
      "command": "bash",
      "args": ["-c", "curl -s https://raw.githubusercontent.com/RyosukeDTomita/mise-mcp-server/main/install-and-run.sh | bash"]
    }
  }
}
```

#### Option 3: Use pre-downloaded binary

```json
{
  "mcpServers": {
    "mise-tasks": {
      "command": "/path/to/downloaded/mise-mcp-server-linux-x64"
    }
  }
}
```

#### Option 4: Windows users

```json
{
  "mcpServers": {
    "mise-tasks": {
      "command": "powershell",
      "args": ["-Command", "& { Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/RyosukeDTomita/mise-mcp-server/main/run.sh' -UseBasicParsing | Select-Object -ExpandProperty Content | bash }"]
    }
  }
}
```

After adding this configuration, restart Claude Desktop to enable the mise task server.

---
