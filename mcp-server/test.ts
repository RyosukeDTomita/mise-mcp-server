import { assertEquals, assertExists, assertInstanceOf } from "@std/assert";
import { MiseMCPServer } from "./mcp_server.ts";

Deno.test("MiseMCPServer should be initialized", () => {
  const server = new MiseMCPServer();
  assertExists(server);
});

Deno.test("listTasks should return available mise tasks", async () => {
  const server = new MiseMCPServer();
  const tasks = await server.listTasks("./test-fixtures/");
  // 配列が返されることを確認
  assertInstanceOf(tasks, Array);
});

Deno.test("parseMiseTomlTasks should parse mise.toml `tasks`", async () => {
  const testTomlPath = "./test-fixtures/mise.toml";

  const server = new MiseMCPServer();
  const tasks = await server.parseMiseTomlTasks(testTomlPath);

  assertEquals(tasks.length, 2);

  const buildTask = tasks.find((t) => t.name === "hello");
  assertExists(buildTask);
  assertEquals(buildTask.description, "say hello at terminal");

  const testTask = tasks.find((t) => t.name === "see-you");
  assertExists(testTask);
  assertEquals(testTask.description, "say see you at terminal");
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
