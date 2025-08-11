import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { createToolFromTask, listTasks, runTask } from "./mise_tasks.ts";
import { runInThisContext } from "node:vm";

export class MiseMCPServer {
  private server: Server;
  private userWorkingDir: string;

  constructor(userWorkingDir: string) {
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
    this.userWorkingDir = userWorkingDir;
  }

  /**
   * constructor作成時にハンドラーを登録し、MCP Clientからのリクエストに応じた処理を行う。
   */
  private setupHandlers() {
    // Handle tool listing
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return await this.handleListTools();
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      return await this.handleToolCall(
        request.params.name,
      );
    });
  }

  /**
   * 使用可能なツールの一覧をMCPの形式で返す。
   */
  async handleListTools() {
    const tasks = await listTasks(this.userWorkingDir, Deno.readTextFile);
    return {
      tools: tasks.map((task) => createToolFromTask(task)),
    };
  }

  /**
   * MCP Serverで使用したいツールを呼び出して実行する。
   * @param toolName
   * @returns
   */
  private async handleToolCall(toolName: string) {
    const result = await runTask(toolName, this.userWorkingDir);
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
