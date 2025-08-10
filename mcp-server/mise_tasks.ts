import { Task } from "./type.ts";
import { parse } from "https://deno.land/std@0.224.0/toml/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

/**
 * ディレクトリを指定しない場合はカレントディレクトリ、指定した場合にはそのディレクトリからmise.tomlを探し、その中で定義されているtaskの一覧を返す。
 * @param taskWorkDir
 * @returns
 */
export async function listTasks(taskWorkDir: string, DenoReadTextFileFn: (path: string) => Promise<string>): Promise<Task[]> {
  const tasks: Task[] = [];

  // ~/.config/mise/config.tomlを読み込む
  try {
    const parsedTasks = await parseMiseTomlTasks(`${Deno.env.get("HOME")}/.config/mise/config.toml`, DenoReadTextFileFn);
    tasks.push(...parsedTasks);
  } catch (error) {
    console.warn(`Failed to parse ~/.config/mise/config.toml:`, error);
  }

  // 指定されたディレクトリからmise.tomlを探す
  const searchDir = taskWorkDir || Deno.cwd();
  const miseTomlPath = join(searchDir, "mise.toml");
  try {
    const parsedTasks = await parseMiseTomlTasks(miseTomlPath, DenoReadTextFileFn);
    tasks.push(...parsedTasks);
  } catch (error) {
    console.warn(`Failed to parse mise.toml:`, error);
  }
  return tasks;
}

/**
 * tomlファイルをパースしてTask型の配列にする
 * @param {string} miseTomlPath
 * @param {function} DenoReadTextFileFn
 * @returns {Task[]}
 */
async function parseMiseTomlTasks(
 // NOTE: テストのしやすさのために、Deno.readTextFileがモックできるように依存性注入を行っている。
  miseTomlPath: string, DenoReadTextFileFn: (path: string) => Promise<string>
): Promise<Task[]> {
  let tomlContent: string;
  try {
    tomlContent = await DenoReadTextFileFn(miseTomlPath);
  } catch (error) {
    console.error(`Error reading ${miseTomlPath}:`, error);
    throw new Error(`Failed to read ${miseTomlPath}: ${error}`);
  }
  const parsed = parse(tomlContent);
  const tasks: Task[] = [];

  if (parsed.tasks) {
    for (const [name, config] of Object.entries(parsed.tasks)) {
      tasks.push({
        name,
        description: config.description,
      });
    }
  }
  return tasks;
}

/**
 * Taskを整形する
 * @param Task
 * @returns Task
 */
export function createToolFromTask(task: Task): Task {
  return {
    name: task.name,
    description: task.description || `Run ${task.name} task`,
  };
}

/**
 * miseを使ってタスクを実行する。
 * @param taskName
 * @param taskWorkDir
 * @returns
 */
export async function runTask(taskName: string, taskWorkDir: string): Promise<{
  success: boolean;
  output?: string;
  error?: string;
  }> {
  const currentDir = Deno.cwd();
  Deno.chdir(taskWorkDir);
  try {
    // mise run <taskName>
    const command = new Deno.Command("mise", {
      args: ["run", taskName],
      stdout: "piped",
      stderr: "piped",
    });

    const { code, stdout, stderr } = await command.output();
    const output = new TextDecoder().decode(stdout);
    const error = new TextDecoder().decode(stderr);

    // clean up
    Deno.chdir(currentDir);

    const is_success = code === 0;
    if (!is_success) {
      console.error(`Task ${taskName} failed with error:`, error);
    }
    return {
      success: is_success,
      output: output || undefined,
      error: error || undefined
    };
  } catch (e) {
    Deno.chdir(currentDir);
    console.error(`Failed to run task ${taskName}:`, e);
    return {
      success: false,
      output: "No output",
      error: `Failed to run task ${taskName}, error: ${e}`
    };
  }
}
