import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MarkdownReader } from "../services/markdown-reader.js";

export function registerDeleteTool(
  server: McpServer,
  reader: MarkdownReader
): void {

  server.registerTool(
    "delete",
    {
      description:
        "Delete a markdown document. This action is irreversible. Use with caution.",
      inputSchema: {
        id: z
          .string()
          .describe(
            "Document ID to delete. Use '__' for hierarchy (e.g., 'git__workflow' for git/workflow.md)"
          ),
      },
    },
    async ({ id }) => {
      const result = await reader.deleteDocument(id);
      if (!result.success) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.error}` }],
          isError: true,
        };
      }
      return {
        content: [
          { type: "text" as const, text: `Document "${id}" deleted successfully.` },
        ],
      };
    }
  );
}
