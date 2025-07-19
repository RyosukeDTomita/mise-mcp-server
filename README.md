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

#### Using npx (recommended)

```shell
npx -y github:RyosukeDTomita/mise-mcp-server/mcp-server
```

#### Running locally with Deno

```shell
cd mcp-server
deno run --allow-run --allow-read main.ts
```

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

Add the following to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "mise-tasks": {
      "command": "npx",
      "args": ["-y", "github:RyosukeDTomita/mise-mcp-server/mcp-server"]
    }
  }
}
```

After adding this configuration, restart Claude Desktop to enable the mise task server.

---
