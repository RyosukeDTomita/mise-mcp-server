import { assertInstanceOf } from "@std/assert";
// import { MiseMCPServer } from "./mcp_server.ts";
import { listTasks } from "./mise_tasks.ts";

Deno.test("listTasks should return available mise tasks", async () => {
  const tasks = await listTasks("./test-fixtures/");
  // 配列が返されることを確認
  assertInstanceOf(tasks, Array);
});
