import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MarkdownReader } from "../services/markdown-reader.js";

export function registerUpdateTool(server: McpServer, markdownDir: string): void {
  const reader = new MarkdownReader(markdownDir);

  server.registerTool(
    "update",
    {
      description: "Update an existing markdown document. Replaces the entire content. When updating, maintain the single-topic focus. The first paragraph after the title becomes the summary shown in the document list, so make it descriptive enough for AI to identify when this document is relevant.",
      inputSchema: {
        id: z.string().describe("Document ID (filename without .md extension)"),
        content: z.string().describe("New full markdown content of the document"),
      },
    },
    async ({ id, content }) => {
      const updated = await reader.updateDocument(id, content);
      if (!updated) {
        return {
          content: [{ type: "text" as const, text: `Error: Document "${id}" not found. Use 'add' to create it.` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: `Document "${id}" updated successfully.` }],
      };
    }
  );
}
