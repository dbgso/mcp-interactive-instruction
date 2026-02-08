import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MarkdownReader } from "./services/markdown-reader.js";
import { registerDescriptionTool } from "./tools/description.js";
import { registerHelpTool } from "./tools/help.js";
import { registerDraftTool } from "./tools/draft/index.js";
import { registerApplyTool } from "./tools/apply/index.js";
import type { ReminderConfig } from "./types/index.js";

const DEFAULT_CONFIG: ReminderConfig = {
  remindMcp: false,
  remindOrganize: false,
  customReminders: [],
  topicForEveryTask: null,
  infoValidSeconds: 60,
};

export function createServer(params: {
  markdownDir: string;
  config?: ReminderConfig;
}): McpServer {
  const { markdownDir, config = DEFAULT_CONFIG } = params;
  const server = new McpServer({
    name: "mcp-interactive-instruction",
    version: "1.0.0",
  });

  // Shared reader instance for consistent caching
  const reader = new MarkdownReader(markdownDir);

  registerDescriptionTool({ server, config });
  registerHelpTool({ server, reader, config });
  registerDraftTool({ server, reader, config });
  registerApplyTool({ server, reader, config });

  return server;
}
