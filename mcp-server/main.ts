import { exit } from "node:process";
import { MiseMCPServer } from "./mcp_server.ts";
import { parseArgs } from "https://deno.land/std/cli/parse_args.ts";

async function main(userWorkingDir: string) {
  const server = new MiseMCPServer(userWorkingDir);
  await server.start();
}

const args = parseArgs(Deno.args, {
  string: ["dir"],
})
const userWorkingDir = args.dir;
if (!userWorkingDir) {
  console.error("User working directory is required. --dir <path>");
  exit(1);
}

if (import.meta.main) {
  main(userWorkingDir).catch(console.error);
}
