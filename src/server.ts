import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerHelpTool } from "./tools/help.js";
import { registerAddTool } from "./tools/add.js";
import { registerUpdateTool } from "./tools/update.js";

export function createServer(markdownDir: string): McpServer {
  const server = new McpServer({
    name: "mcp-interactive-instruction",
    version: "1.0.0",
  });

  registerHelpTool(server, markdownDir);
  registerAddTool(server, markdownDir);
  registerUpdateTool(server, markdownDir);

  return server;
}
