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

### compile Deno Code

```shell
cd mise-mcp-server/mcp-server
deno run compile
```

### setup MCP Server

For VS Code, edit `.vscode/mcp.json`

```json
{
    "servers": {
      "mise-tasks": {
        "command": "/home/sigma/mise-mcp-server/mcp-server/bin/mise-mcp-server-linux-x64"
      }
    }
  }
```
