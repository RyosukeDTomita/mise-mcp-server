import { assertEquals, assertExists, assertInstanceOf } from "@std/assert";
import { MiseMCPServer } from "./mcp_server.ts";

Deno.test("MiseMCPServer should be initialized", () => {
  const server = new MiseMCPServer();
  assertExists(server);
});

Deno.test("listTasks should return available mise tasks", async () => {
  const server = new MiseMCPServer();
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
  
  const server = new MiseMCPServer();
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
  const server = new MiseMCPServer();
  const result = await server.runTask("echo", ["Hello", "World"]);
  
  assertExists(result);
  assertEquals(result.success, true);
  assertExists(result.output);
});

Deno.test("runTask should handle task failure", async () => {
  const server = new MiseMCPServer();
  const result = await server.runTask("nonexistent-command", []);
  
  assertExists(result);
  assertEquals(result.success, false);
  assertExists(result.error);
});

// NEW TDD TESTS: Dynamic tool listing from mise.toml tasks

Deno.test("MCP server should list mise.toml tasks as individual tools", async () => {
  // Create a temporary mise.toml file for testing
  const testToml = `
[tasks.build]
run = "deno compile main.ts"
description = "Build the project"

[tasks.test]  
run = "deno test"
description = "Run tests"

[tasks.dev]
run = "deno run --watch main.ts"
description = "Start development server"
`;
  
  // Write test file
  await Deno.writeTextFile("./test-mise.toml", testToml);
  
  try {
    const server = new MiseMCPServer();
    
    // Mock the server's listTools method to use our test directory
    const originalListTasks = server.listTasks.bind(server);
    server.listTasks = async () => {
      const tomlContent = await Deno.readTextFile("./test-mise.toml");
      return await server.parseMiseTomlTasks(tomlContent);
    };
    
    // Get tools from MCP server
    const toolsResponse = await server.getTools();
    const tools = toolsResponse.tools;
    
    // Should have 3 dynamic tools (build, test, dev)
    assertEquals(tools.length, 3);
    
    // Check build tool
    const buildTool = tools.find(tool => tool.name === "build");
    assertExists(buildTool);
    assertEquals(buildTool.description, "Build the project");
    
    // Check test tool  
    const testTool = tools.find(tool => tool.name === "test");
    assertExists(testTool);
    assertEquals(testTool.description, "Run tests");
    
    // Check dev tool
    const devTool = tools.find(tool => tool.name === "dev");
    assertExists(devTool);
    assertEquals(devTool.description, "Start development server");
    
  } finally {
    // Clean up test file
    try {
      await Deno.remove("./test-mise.toml");
    } catch {
      // File might not exist
    }
  }
});

Deno.test("MCP server should execute mise tasks via dynamic tools", async () => {
  const server = new MiseMCPServer();
  
  // Test calling a command that should work (echo is usually available)
  const response = await server.callTool({
    name: "echo",
    arguments: { args: ["Hello", "from", "dynamic", "tool"] }
  });
  
  assertExists(response);
  assertEquals(response.success, true);
  assertExists(response.content);
  assertEquals(response.content.length, 1);
  assertEquals(response.content[0].type, "text");
});

Deno.test("Dynamic tools should have proper input schema", async () => {
  const testToml = `
[tasks.build]
run = "deno compile main.ts"
description = "Build the project"
`;
  
  // Write test file
  await Deno.writeTextFile("./test-mise.toml", testToml);
  
  try {
    const server = new MiseMCPServer();
    
    // Mock the server's listTasks method
    const originalListTasks = server.listTasks.bind(server);
    server.listTasks = async () => {
      const tomlContent = await Deno.readTextFile("./test-mise.toml");
      return await server.parseMiseTomlTasks(tomlContent);
    };
    
    const toolsResponse = await server.getTools();
    const buildTool = toolsResponse.tools.find(tool => tool.name === "build");
    
    assertExists(buildTool);
    assertExists(buildTool.inputSchema);
    assertEquals(buildTool.inputSchema.type, "object");
    assertExists(buildTool.inputSchema.properties);
    
  } finally {
    // Clean up test file
    try {
      await Deno.remove("./test-mise.toml");
    } catch {
      // File might not exist
    }
  }
});