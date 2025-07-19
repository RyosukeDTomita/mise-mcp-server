#!/usr/bin/env node

// Standalone MCP Server for mise tasks
// Can be executed directly from GitHub Raw URL

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// MCP Server implementation
class MCPServer {
  constructor() {
    this.running = false;
  }
  
  getInfo() {
    return {
      name: "mise-task-server",
      version: "0.1.0",
      protocolVersion: "0.1.0"
    };
  }
  
  listTools() {
    return [
      {
        name: "mise/listTasks",
        description: "List all available mise tasks",
        inputSchema: {
          type: "object",
          properties: {
            directory: {
              type: "string",
              description: "Directory to search for mise.toml (optional)"
            }
          }
        }
      },
      {
        name: "mise/runTask",
        description: "Run a specific mise task",
        inputSchema: {
          type: "object",
          properties: {
            task: {
              type: "string",
              description: "The name of the task to run"
            },
            args: {
              type: "array",
              items: { type: "string" },
              description: "Arguments to pass to the task"
            }
          },
          required: ["task"]
        }
      }
    ];
  }
  
  async listTasks(directory) {
    const searchDir = directory || process.cwd();
    const tasks = [];
    
    // Look for mise.toml file
    const miseTomlPath = path.join(searchDir, 'mise.toml');
    try {
      const tomlContent = fs.readFileSync(miseTomlPath, 'utf8');
      // Simple TOML parsing for tasks
      const taskMatches = tomlContent.match(/\[tasks\.(\w+)\]/g);
      if (taskMatches) {
        for (const match of taskMatches) {
          const taskName = match.match(/\[tasks\.(\w+)\]/)[1];
          tasks.push({ name: taskName, description: `Task: ${taskName}` });
        }
      }
    } catch {
      // mise.toml not found
    }
    
    return tasks;
  }
  
  async runTask(taskName, args = []) {
    return new Promise((resolve) => {
      const command = spawn('mise', ['run', taskName, ...args], {
        stdout: 'pipe',
        stderr: 'pipe'
      });
      
      let output = '';
      let error = '';
      
      command.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      command.stderr.on('data', (data) => {
        error += data.toString();
      });
      
      command.on('close', (code) => {
        resolve({
          success: code === 0,
          output: output || undefined,
          error: code !== 0 ? error || "Task failed" : undefined
        });
      });
      
      command.on('error', (err) => {
        resolve({
          success: false,
          error: err.message
        });
      });
    });
  }
  
  async handleRequest(request) {
    try {
      switch (request.method) {
        case "initialize":
          return {
            jsonrpc: "2.0",
            id: request.id,
            result: {
              protocolVersion: "0.1.0",
              capabilities: { tools: {} },
              serverInfo: this.getInfo()
            }
          };
          
        case "tools/list":
          return {
            jsonrpc: "2.0",
            id: request.id,
            result: {
              tools: this.listTools().map(tool => ({
                ...tool,
                inputSchema: tool.inputSchema || { type: "object", properties: {}, required: [] }
              }))
            }
          };
          
        case "tools/call":
          const params = request.params;
          let response;
          
          if (params.name === "mise/listTasks") {
            const tasks = await this.listTasks(params.arguments?.directory);
            response = { success: true, result: tasks };
          } else if (params.name === "mise/runTask") {
            const result = await this.runTask(params.arguments.task, params.arguments.args);
            response = result;
          } else {
            response = { success: false, error: `Unknown tool: ${params.name}` };
          }
          
          if (response.success) {
            return {
              jsonrpc: "2.0",
              id: request.id,
              result: {
                content: [
                  {
                    type: "text",
                    text: typeof response.result === "string" 
                      ? response.result 
                      : JSON.stringify(response.result, null, 2)
                  }
                ]
              }
            };
          } else {
            return {
              jsonrpc: "2.0",
              id: request.id,
              error: {
                code: -32603,
                message: response.error || "Internal error"
              }
            };
          }
          
        default:
          return {
            jsonrpc: "2.0",
            id: request.id,
            error: {
              code: -32601,
              message: "Method not found"
            }
          };
      }
    } catch (error) {
      return {
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32603,
          message: error.message
        }
      };
    }
  }
}

// Main function
async function main() {
  const server = new MCPServer();
  const encoder = new TextEncoder();
  
  process.stdin.setEncoding('utf8');
  
  let buffer = '';
  
  process.stdin.on('data', async (chunk) => {
    buffer += chunk;
    
    // Process complete lines
    let lines = buffer.split('\n');
    buffer = lines.pop() || ''; // Keep incomplete line in buffer
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      try {
        const request = JSON.parse(trimmedLine);
        const response = await server.handleRequest(request);
        
        process.stdout.write(JSON.stringify(response) + '\n');
      } catch (error) {
        const errorResponse = {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: "Parse error",
            data: error.message
          }
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    }
  });
  
  process.stdin.on('end', () => {
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch(console.error);
}