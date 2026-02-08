import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MarkdownReader } from "../../services/markdown-reader.js";
import { wrapResponse } from "../../utils/response-wrapper.js";
import type { ReminderConfig, DraftActionHandler } from "../../types/index.js";
import {
  ListHandler,
  ReadHandler,
  AddHandler,
  UpdateHandler,
  DeleteHandler,
  RenameHandler,
} from "./handlers/index.js";

const DRAFT_HELP = `# Draft Tool

Manage temporary documentation drafts. AI can freely create, update, and delete drafts without permission.

## IMPORTANT RULES

### New information = New file
- **Different topic = always create new draft** (use "add", not "update")
- **"update" is ONLY for refining the same topic** (fixing typos, improving wording)
- If you can describe the content with a different "about X" phrase, it's a separate topic

### Use hierarchy to express relationships
Group related topics with prefixes:
\`\`\`
coding__params-style    ← About argument format
coding__shared-code     ← About code sharing
coding__testing         ← About testing rules
\`\`\`

### Granularity guide
- If you can say "This is about X" in one phrase → 1 topic
- If multiple "about X" are mixed → split into separate files

## Actions

- \`draft()\` - Show this help
- \`draft(action: "list")\` - List all drafts
- \`draft(action: "read", id: "<id>")\` - Read a draft
- \`draft(action: "add", id: "<id>", content: "<content>")\` - Create new draft
- \`draft(action: "update", id: "<id>", content: "<content>")\` - Update existing draft (same topic only!)
- \`draft(action: "delete", id: "<id>")\` - Delete a draft
- \`draft(action: "rename", id: "<oldId>", newId: "<newId>")\` - Rename/move a draft (safe reorganization)

## Examples

User says: "Use params object for function arguments"
\`\`\`
draft(action: "add", id: "coding__params-style", content: "# Params Style\\n\\nAll function arguments must use object format.")
\`\`\`

User then says: "Always write unit tests for services"
\`\`\`
draft(action: "add", id: "coding__testing", content: "# Testing Rules\\n\\nService classes must have unit tests.")
\`\`\`
Note: This is a NEW topic, so use "add" not "update"!

Drafts are stored under \`_mcp_drafts/\` directory. Use \`apply\` tool to promote to confirmed docs.`;

const actionHandlers: Record<string, DraftActionHandler> = {
  list: new ListHandler(),
  read: new ReadHandler(),
  add: new AddHandler(),
  update: new UpdateHandler(),
  delete: new DeleteHandler(),
  rename: new RenameHandler(),
};

export function registerDraftTool(params: {
  server: McpServer;
  reader: MarkdownReader;
  config: ReminderConfig;
}): void {
  const { server, reader, config } = params;

  server.registerTool(
    "draft",
    {
      description:
        "Manage temporary documentation drafts. AI should freely use this to record any new information learned from user instructions. No permission needed - update drafts whenever you learn something new. Keep one topic per file for easy retrieval. IMPORTANT: New topic = new file (add), NOT update existing. Use hierarchy like 'coding__testing' to group related topics.",
      inputSchema: {
        action: z
          .enum(["list", "read", "add", "update", "delete", "rename"])
          .optional()
          .describe("Action to perform. Omit to show help."),
        id: z
          .string()
          .optional()
          .describe("Draft ID (without '_mcp_drafts__' prefix)"),
        content: z
          .string()
          .optional()
          .describe("Markdown content for add/update actions"),
        newId: z
          .string()
          .optional()
          .describe("New draft ID for rename action"),
      },
    },
    async ({ action, id, content, newId }) => {
      if (!action) {
        return wrapResponse({
          result: {
            content: [{ type: "text" as const, text: DRAFT_HELP }],
          },
          config,
        });
      }

      const handler = actionHandlers[action];
      if (!handler) {
        return wrapResponse({
          result: {
            content: [
              { type: "text" as const, text: `Error: Unknown action "${action}"` },
            ],
            isError: true,
          },
          config,
        });
      }

      const result = await handler.execute({
        actionParams: { id, content, newId },
        context: { reader, config },
      });
      return wrapResponse({ result, config });
    }
  );
}
