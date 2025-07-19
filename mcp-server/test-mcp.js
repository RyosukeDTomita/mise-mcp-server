#!/usr/bin/env node

// Test script for MCP server
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testMCP = () => {
  const serverPath = join(__dirname, 'bin', 'mise-mcp-server.js');
  
  console.log('Starting MCP server test...');
  console.log('Server path:', serverPath);
  
  const server = spawn('node', [serverPath], {
    stdio: ['pipe', 'pipe', 'inherit']
  });
  
  let responseCount = 0;
  
  // Send initialize request
  const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "0.1.0",
      capabilities: {}
    }
  };
  
  server.stdin.write(JSON.stringify(initRequest) + '\n');
  
  server.stdout.on('data', (data) => {
    const responses = data.toString().trim().split('\n');
    
    responses.forEach(responseStr => {
      if (!responseStr) return;
      
      try {
        const response = JSON.parse(responseStr);
        responseCount++;
        
        console.log(`Response ${responseCount}:`, JSON.stringify(response, null, 2));
        
        if (responseCount === 1 && response.id === 1) {
          // Send tools/list request after initialize
          const toolsRequest = {
            jsonrpc: "2.0",
            id: 2,
            method: "tools/list",
            params: {}
          };
          
          server.stdin.write(JSON.stringify(toolsRequest) + '\n');
        } else if (responseCount === 2) {
          // Close after receiving tools/list response
          setTimeout(() => {
            server.kill('SIGTERM');
          }, 100);
        }
      } catch (e) {
        console.error('Failed to parse response:', responseStr);
      }
    });
  });
  
  server.on('error', (error) => {
    console.error('Server error:', error);
  });
  
  server.on('close', (code) => {
    console.log('Server closed with code:', code);
  });
};

testMCP();