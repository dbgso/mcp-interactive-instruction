import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { wrapResponse } from "../utils/response-wrapper.js";
import type { ReminderConfig } from "../types/index.js";

function buildDescription(params: { infoValidSeconds: number }): string {
  const { infoValidSeconds } = params;
  return `# MCP Interactive Instruction

**IMPORTANT: Information from this MCP is only valid for ${infoValidSeconds} seconds. Documents may be updated at any time. Always re-read before each task to get the latest rules.**

This MCP provides tools for managing documentation that AI can autonomously maintain.

## Tools Overview

### help
Browse and read confirmed documentation.
- \`help()\` - List all confirmed documents
- \`help(id: "<id>")\` - Read a specific document
- \`help(recursive: true)\` - List all documents including nested

### draft
Manage temporary documentation drafts. **AI can freely use this without permission.**
- \`draft()\` - Show draft tool help
- \`draft(action: "list")\` - List all drafts
- \`draft(action: "read", id: "<id>")\` - Read a draft
- \`draft(action: "add", id: "<id>", content: "<content>")\` - Create new draft
- \`draft(action: "update", id: "<id>", content: "<content>")\` - Update draft
- \`draft(action: "delete", id: "<id>")\` - Delete draft

### apply
Promote drafts to confirmed documentation. **Requires user approval.**
- \`apply()\` - Show apply tool help
- \`apply(action: "list")\` - List drafts ready to promote
- \`apply(action: "promote", draftId: "<id>")\` - Promote draft

## AI Guidelines

1. **Record everything new**: When you learn something from user instructions, immediately create a draft
2. **One topic per file**: Keep each document focused on a single topic
3. **Name by AI's search**: Use names that AI would search for (e.g., \`why-this-project\`, \`setup\`, \`getting-started\`)
4. **Update freely**: Drafts are temporary - modify them without hesitation
5. **Ask before applying**: Always get user approval before promoting drafts to confirmed docs`;
}

export function registerDescriptionTool(params: {
  server: McpServer;
  config: ReminderConfig;
}): void {
  const { server, config } = params;
  const description = buildDescription({ infoValidSeconds: config.infoValidSeconds });

  server.registerTool(
    "description",
    {
      description:
        "Show detailed usage instructions for all MCP tools. Call this to understand how to use this MCP.",
      inputSchema: {},
    },
    async () => {
      return wrapResponse({
        result: {
          content: [{ type: "text" as const, text: description }],
        },
        config,
      });
    }
  );
}
