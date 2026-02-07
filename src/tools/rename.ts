import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MarkdownReader } from "../services/markdown-reader.js";

export function registerRenameTool(
  server: McpServer,
  reader: MarkdownReader
): void {

  server.registerTool(
    "rename",
    {
      description:
        "Rename or move a markdown document. Changes the document ID (and file path). Use this to reorganize documents or fix naming.",
      inputSchema: {
        oldId: z
          .string()
          .describe(
            "Current document ID. Use '__' for hierarchy (e.g., 'git__workflow')"
          ),
        newId: z
          .string()
          .describe(
            "New document ID. Use '__' for hierarchy (e.g., 'git__advanced__workflow')"
          ),
      },
    },
    async ({ oldId, newId }) => {
      const result = await reader.renameDocument(oldId, newId);
      if (!result.success) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.error}` }],
          isError: true,
        };
      }
      return {
        content: [
          {
            type: "text" as const,
            text: `Document renamed from "${oldId}" to "${newId}" successfully.`,
          },
        ],
      };
    }
  );
}
