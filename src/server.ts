import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MarkdownReader } from "./services/markdown-reader.js";
import { registerHelpTool } from "./tools/help.js";
import { registerAddTool } from "./tools/add.js";
import { registerUpdateTool } from "./tools/update.js";
import { registerDeleteTool } from "./tools/delete.js";
import { registerRenameTool } from "./tools/rename.js";

export function createServer(markdownDir: string): McpServer {
  const server = new McpServer({
    name: "mcp-interactive-instruction",
    version: "1.0.0",
  });

  // Shared reader instance for consistent caching
  const reader = new MarkdownReader(markdownDir);

  registerHelpTool(server, reader);
  registerAddTool(server, reader);
  registerUpdateTool(server, reader);
  registerDeleteTool(server, reader);
  registerRenameTool(server, reader);

  return server;
}
