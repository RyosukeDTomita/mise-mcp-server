import { MCPServer } from "./mcp_server.ts";
import { readLines } from "https://deno.land/std@0.224.0/io/read_lines.ts";

async function main() {
  const server = new MCPServer();
  
  // MCP servers communicate via stdin/stdout
  const encoder = new TextEncoder();
  
  try {
    for await (const line of readLines(Deno.stdin)) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      try {
        const request = JSON.parse(trimmedLine);
        const response = await server.handleRequest(request);
        
        // Send response to stdout
        const responseText = JSON.stringify(response) + "\n";
        await Deno.stdout.write(encoder.encode(responseText));
      } catch (error) {
        // Send error response
        const errorResponse = {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: "Parse error",
            data: error instanceof Error ? error.message : "Unknown error"
          }
        };
        const responseText = JSON.stringify(errorResponse) + "\n";
        await Deno.stdout.write(encoder.encode(responseText));
      }
    }
  } catch (error) {
    // Log to stderr for debugging
    const errorMsg = `Main loop error: ${error instanceof Error ? error.message : "Unknown error"}\n`;
    await Deno.stderr.write(encoder.encode(errorMsg));
  }
}

if (import.meta.main) {
  main().catch(console.error);
}
