#!/usr/bin/env node

// Minimal test script
console.log('MCP Server Test Script');
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('Script location:', __dirname);

// Output a simple MCP response to test connectivity
const response = {
  jsonrpc: "2.0",
  id: 1,
  result: {
    protocolVersion: "0.1.0",
    capabilities: { tools: {} },
    serverInfo: { name: "test-server", version: "0.1.0" }
  }
};

console.log(JSON.stringify(response));