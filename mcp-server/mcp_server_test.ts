import { assertEquals, assertExists, assertInstanceOf } from "@std/assert";
import { MCPServer } from "./mcp_server.ts";

Deno.test("MCPServer should be initialized", () => {
  const server = new MCPServer();
  assertExists(server);
});

Deno.test("MCPServer should have proper info", () => {
  const server = new MCPServer();
  const info = server.getInfo();
  
  assertEquals(info.name, "mise-task-server");
  assertEquals(info.version, "0.1.0");
  assertEquals(info.protocolVersion, "0.1.0");
});

Deno.test("MCPServer should start and listen", async () => {
  const server = new MCPServer();
  
  await server.start();
  
  assertEquals(server.isRunning(), true);
  
  await server.stop();
  assertEquals(server.isRunning(), false);
});

Deno.test("MCPServer should list available tools", () => {
  const server = new MCPServer();
  const tools = server.listTools();
  
  assertInstanceOf(tools, Array);
  assertEquals(tools.length, 2);
  
  const listTasksTool = tools.find(tool => tool.name === "mise-list-tasks");
  assertExists(listTasksTool);
  assertEquals(listTasksTool.description, "List all available mise tasks");
  
  const runTaskTool = tools.find(tool => tool.name === "mise-run-task");
  assertExists(runTaskTool);
  assertEquals(runTaskTool.description, "Run a specific mise task");
});

Deno.test("listTasks should return available mise tasks", async () => {
  const server = new MCPServer();
  const tasks = await server.listTasks();
  
  assertInstanceOf(tasks, Array);
});

Deno.test("listTasks should parse mise.toml tasks", async () => {
  const testToml = `
[tasks.build]
run = "deno compile main.ts"
description = "Build the project"

[tasks.test]
run = "deno test"
depends = ["build"]
`;
  
  const server = new MCPServer();
  const tasks = await server.parseMiseTomlTasks(testToml);
  
  assertEquals(tasks.length, 2);
  
  const buildTask = tasks.find(t => t.name === "build");
  assertExists(buildTask);
  assertEquals(buildTask.description, "Build the project");
  
  const testTask = tasks.find(t => t.name === "test");
  assertExists(testTask);
  assertEquals(testTask.dependencies, ["build"]);
});

Deno.test("runTask should execute a mise task", async () => {
  const server = new MCPServer();
  const result = await server.runTask("echo", ["Hello", "World"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertExists(result.output);
});

Deno.test("runTask should handle task failure", async () => {
  const server = new MCPServer();
  const result = await server.runTask("nonexistent-command", []);
  
  assertExists(result);
  assertEquals(result.success, false);
  assertExists(result.error);
});

Deno.test("handleToolCall should process listTasks request", async () => {
  const server = new MCPServer();
  const request = {
    tool: "mise-list-tasks",
    arguments: {}
  };
  
  const response = await server.handleToolCall(request);
  
  assertExists(response);
  assertEquals(response.success, true);
  assertInstanceOf(response.result, Array);
});

Deno.test("handleToolCall should process runTask request", async () => {
  const server = new MCPServer();
  const request = {
    tool: "mise-run-task",
    arguments: {
      task: "echo",
      args: ["Hello from MCP"]
    }
  };
  
  const response = await server.handleToolCall(request);
  
  assertExists(response);
  assertEquals(response.success, true);
  assertExists(response.result);
});