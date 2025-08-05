import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createToolFromTask, listTasks, runTask } from "./mise.ts";

export class MiseMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: "mise-task-server",
        version: "0.2.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupHandlers();
  }

  /**
   * constructor作成時にハンドラーを登録し、MCP Clientからのリクエストに応じた処理を行う。
   */
  private setupHandlers() {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return await this.getTools();
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await this.handleToolCall(
        request.params.name,
        request.params.arguments,
      );
    });
  }

  /**
   * MCP Serverで使用可能なツールの一覧をを返す。
   * @returns {}
   */
  async getTools() {
    const tasks = await listTasks();

    return {
      tools: tasks.map((task) => createToolFromTask(task)),
    };
  }

  private async handleToolCall(toolName: string, args: any) {
    try {
      if (toolName === "mise-list-tasks") {
        return await this.handleListTasksTool(args.directory);
      }

      if (toolName === "mise-run-task") {
        return await this.handleRunTaskTool(args);
      }

      // Handle dynamic tools (mise.toml tasks)
      return await this.handleDynamicTool(toolName, args);
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${
              error instanceof Error ? error.message : "Unknown error occurred"
            }`,
          },
        ],
      };
    }
  }

  private async handleListTasksTool(directory: string) {
    const tasks = await listTasks(directory);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(tasks, null, 2),
        },
      ],
    };
  }

  private async handleRunTaskTool(args: any) {
    const { task, args: taskArgs } = args as {
      task: string;
      args?: string[];
    };

    if (!task || typeof task !== "string") {
      throw new Error("Task name is required and must be a string");
    }

    const result = await runTask(task, taskArgs || []);

    return {
      content: [
        {
          type: "text",
          text: result.success
            ? result.output || "Task completed successfully"
            : result.error || "Task failed",
        },
      ],
    };
  }


  private async handleDynamicTool(toolName: string, args: any) {
    if (!toolName || typeof toolName !== "string") {
      throw new Error("Tool name is required and must be a string");
    }

    const taskArgs = args?.args || [];
    if (taskArgs && !Array.isArray(taskArgs)) {
      throw new Error("Arguments must be an array");
    }

    const result = await runTask(toolName, taskArgs);

    return {
      content: [
        {
          type: "text",
          text: result.success
            ? result.output || "Task completed successfully"
            : result.error || "Task failed",
        },
      ],
    };
  }

  async callTool(request: { name: string; arguments: any }) {
    const result = await runTask(
      request.name,
      request.arguments?.args || [],
    );

    return {
      success: result.success,
      content: [
        {
          type: "text",
          text: result.success
            ? result.output || "Task completed successfully"
            : result.error || "Task failed",
        },
      ],
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

export { MiseMCPServer as MCPServer };
