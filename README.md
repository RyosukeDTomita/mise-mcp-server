# mise-task-mcp-server

![mit license](https://img.shields.io/github/license/RyosukeDTomita/mise-mcp-server)

## INDEX

- [ABOUT](#about)
- [ENVIRONMENT](#environment)
- [PREPARING](#preparing)
- [HOW TO USE](#how-to-use)
- [FOR DEVELOPER](#for-developer)

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

> [!WARN]
> `mise` cannot run tasks before `mise trust`.
> Before running this MCP Server, You should run command below.
>
> ```shell
> mise trust <your dir>
> ````

```shell
# list tools
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/list"}' | deno task dev --dir /home/sigma/mise-mcp-server/mcp-server/test-fixtures;
Task dev deno run --watch --allow-env=HOME --allow-read --allow-write --allow-run main.ts "--dir" "/home/sigma/mise-mcp-server/mcp-server/test-fixtures"
Watcher Process started.
{"result":{"tools":[{"name":"restart-alsa","description":"Restart ALSA to fix the audio output issue"},{"name":"hello","description":"hello test-fixtures/mise.toml"},{"name":"see-you","description":"see you test-fixtures/mise.toml"}]},"jsonrpc":"2.0","id":2}
```

```shell
# use tools
echo '{"jsonrpc": "2.0", "id": 2, "method": "tools/call", "params": {"name": "hello", "arguments": {}}}' | deno task dev --dir /home/sigma/mise-mcp-server/mcp-server/test-fixtures;
Task dev deno run --watch --allow-env=HOME --allow-read --allow-write --allow-run main.ts "--dir" "/home/sigma/mise-mcp-server/mcp-server/test-fixtures"
Watcher Process started.
{"result":{"success":true,"content":[{"type":"text","text":"Hello test-fixtures/mise.toml.\n"}]},"jsonrpc":"2.0","id":2}
Watcher Process finished. Restarting on file change...
```

---

## FOR DEVELOPER

```shell
cd mcp-server/test-fixtures/
mise trust
```

### Commands

```shell
cd mcp-server/
deno lint
deno fmt
deno task test
```
