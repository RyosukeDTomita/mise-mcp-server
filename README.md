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

---

## FOR DEVELOPER

```shell
cd mcp-server/
deno lint
deno fmt
deno task test
```
