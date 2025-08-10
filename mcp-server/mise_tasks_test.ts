import { assertEquals, assertInstanceOf } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { listTasks, runTask } from "./mise_tasks.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

Deno.test("listTasks should return available mise tasks, when called with a directory contains mise.toml", async () => {
  const tasks = await listTasks("./test-fixtures/", Deno.readTextFile);
  assertInstanceOf(tasks, Array);
  
  // tasks配列のどれか一つの.name要素に./test-fixtures/mise.tomlに定義されているタスク名が含まれていることを確認
  const hasHelloTask = tasks.some(task => task.name === "hello");
  assertEquals(hasHelloTask, true, "Should have a task named 'hello'");
  // helloタスクのdescriptionが./test-fixtures/mise.tomlに定義されているものと一致するか確認
  const helloTask = tasks.find(task => task.name === "hello");
  assertEquals(helloTask?.description, "hello test-fixtures/mise.toml");
});

Deno.test("listTasks should return available mise tasks defined in ~/.config/mise/config.toml", async () => {
  // ~/.config/mise/config.tomlをモックすることで、ユーザのホームディレクトリに依存せずにテストを実行できるようにしている。
  const mockDenoReadTextFile = async (path: string) => {
    if (path === `${Deno.env.get("HOME")}/.config/mise/config.toml`) {
      return `
# Example config.toml file

[tasks.hello]
run = "echo ."
description = "hello ~/.config/mise/config.toml"

[tasks.see-you]
run = "echo see you."
description = "see you ~/.config/mise/config.toml"
`
    }
    return await Deno.readTextFile(path);
  };

  // ~/.config/mise/config.tomlからタスクを取得できるか確認するために、存在しないディレクトリを指定している。
  const tasks = await listTasks("./not-existing-directory", mockDenoReadTextFile);
  assertInstanceOf(tasks, Array);

  // tasks配列のどれか一つの.name要素に~/.config/mise/config.tomlに定義されているタスク名が含まれていることを確認
  const hasHelloTask = tasks.some(task => task.name === "hello");
  assertEquals(hasHelloTask, true, "Should have a task named 'hello'");
  // helloタスクのdescriptionがMocked Deno.readTextFile関数によって返された内容と一致するか確認
  const helloTask = tasks.find(task => task.name === "hello");
  assertEquals(helloTask?.description, "hello ~/.config/mise/config.toml");
});

Deno.test("runTask should execute a task and return the result", async () => {
  const taskWorkDir = join(Deno.cwd(), "test-fixtures");
  const result = await runTask("hello", taskWorkDir);
  assertEquals(result.success, true);
  assertEquals(result.output, "Hello test-fixtures/mise.toml.\n");
});
