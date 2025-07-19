import { assertEquals, assertExists } from "@std/assert";
import { MCPServer } from "./mcp_server.ts";

interface InitializeResponse {
  jsonrpc: string;
  id: number | string;
  result: {
    protocolVersion: string;
    capabilities: object;
    serverInfo: object;
  };
}

interface ToolsListResponse {
  jsonrpc: string;
  id: number | string;
  result: {
    tools: Array<object>;
  };
}

Deno.test("MCP server should handle initialize request", async () => {
  const server = new MCPServer();
  const request = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "0.1.0",
      capabilities: {}
    }
  };
  
  const response = await server.handleRequest(request) as InitializeResponse;
  
  assertExists(response);
  assertEquals(response.jsonrpc, "2.0");
  assertEquals(response.id, 1);
  assertExists(response.result);
  assertEquals(response.result.protocolVersion, "0.1.0");
  assertExists(response.result.capabilities);
  assertExists(response.result.serverInfo);
});

Deno.test("MCP server should handle tools/list request", async () => {
  const server = new MCPServer();
  const request = {
    jsonrpc: "2.0",
    id: 2,
    method: "tools/list",
    params: {}
  };
  
  const response = await server.handleRequest(request) as ToolsListResponse;
  
  assertExists(response);
  assertEquals(response.jsonrpc, "2.0");
  assertEquals(response.id, 2);
  assertExists(response.result);
  assertExists(response.result.tools);
  assertEquals(response.result.tools.length, 2);
});

Deno.test("MCP server should handle tools/call request", async () => {
  const server = new MCPServer();
  const request = {
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: {
      name: "mise-list-tasks",
      arguments: {}
    }
  };
  
  const response = await server.handleRequest(request);
  
  assertExists(response);
  assertEquals(response.jsonrpc, "2.0");
  assertEquals(response.id, 3);
  assertExists(response.result);
});