import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MarkdownReader } from "../../services/markdown-reader.js";
import { wrapResponse } from "../../utils/response-wrapper.js";
import type { ReminderConfig, ApplyActionHandler } from "../../types/index.js";
import { ListHandler, PromoteHandler } from "./handlers/index.js";

const APPLY_HELP = `# Apply Tool

Promote drafts to confirmed documentation. This action requires user approval.

## Actions

- \`apply()\` - Show this help
- \`apply(action: "list")\` - List drafts ready to promote
- \`apply(action: "promote", draftId: "<id>", targetId?: "<id>")\` - Promote draft to confirmed docs

## Examples

Promote a draft with same name:
\`\`\`
apply(action: "promote", draftId: "coding-style")
\`\`\`
This moves \`_mcp_drafts/coding-style.md\` to \`coding-style.md\`

Promote with different name:
\`\`\`
apply(action: "promote", draftId: "coding-style", targetId: "rules__coding-style")
\`\`\`
This moves \`_mcp_drafts/coding-style.md\` to \`rules/coding-style.md\``;

const actionHandlers: Record<string, ApplyActionHandler> = {
  list: new ListHandler(),
  promote: new PromoteHandler(),
};

export function registerApplyTool(params: {
  server: McpServer;
  reader: MarkdownReader;
  config: ReminderConfig;
}): void {
  const { server, reader, config } = params;

  server.registerTool(
    "apply",
    {
      description:
        "Promote drafts to confirmed documentation. Use this after user approves a draft. Moves document from drafts/ to the main documentation.",
      inputSchema: {
        action: z
          .enum(["list", "promote"])
          .optional()
          .describe("Action to perform. Omit to show help."),
        draftId: z
          .string()
          .optional()
          .describe("Draft ID to promote (without 'drafts__' prefix)"),
        targetId: z
          .string()
          .optional()
          .describe(
            "Target ID for confirmed doc. If omitted, uses same ID as draft."
          ),
      },
    },
    async ({ action, draftId, targetId }) => {
      if (!action) {
        return wrapResponse({
          result: {
            content: [{ type: "text" as const, text: APPLY_HELP }],
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
        actionParams: { draftId, targetId },
        context: { reader, config },
      });
      return wrapResponse({ result, config });
    }
  );
}
