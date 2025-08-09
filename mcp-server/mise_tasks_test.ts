import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.224.0/assert/mod.ts";
// import { MiseMCPServer } from "./mcp_server.ts";
import { listTasks } from "./mise_tasks.ts";

Deno.test("listTasks should return available mise tasks", async () => {
  const tasks = await listTasks("./test-fixtures/");
  // 配列が返されることを確認
  assertInstanceOf(tasks, Array);
  
  // tasks配列のどれか一つの.name要素に./test-fixtures/mise.tomlに定義されているタスク名が含まれていることを確認
  const hasHelloTask = tasks.some(task => task.name === "hello");
  assertEquals(hasHelloTask, true, "Should have a task named 'hello'");
});

// Deno.test("listTasks: returns task from ~/.config/mise/config.toml", async () => {
//   const mockReadTextFile = async (path: string): Promise<string> => {
//     if (path === "~/.config/mise/config.toml") {
//       return `
// [tasks.global-task]
// description = "global task"
// `;
//     }
//     throw new Deno.errors.NotFound("Mock: file not found");
//   };

//   const tasks = await listTasks("/not-existing-directory", mockReadTextFile);
//   assertEquals(tasks.length, 1);
//   assertEquals(tasks[0], { name: "global-task", description: "global task" });
// });