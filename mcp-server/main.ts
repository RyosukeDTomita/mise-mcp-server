import { MiseMCPServer } from "./mcp_server.ts";

async function main() {
  const server = new MiseMCPServer();
  await server.start();
}

if (import.meta.main) {
  main().catch(console.error);
}
