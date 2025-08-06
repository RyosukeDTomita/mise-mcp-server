import { assertExists } from "@std/assert";
import { MiseMCPServer } from "./mcp_server.ts";

Deno.test("MiseMCPServer should be initialized", () => {
  const server = new MiseMCPServer();
  assertExists(server);
});
