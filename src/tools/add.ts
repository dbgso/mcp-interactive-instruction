import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MarkdownReader } from "../services/markdown-reader.js";

export function registerAddTool(server: McpServer, markdownDir: string): void {
  const reader = new MarkdownReader(markdownDir);

  server.registerTool(
    "add",
    {
      description: "Add a new markdown document. The ID becomes the filename (without .md extension).",
      inputSchema: {
        id: z.string().describe("Document ID (will be used as filename without .md)"),
        content: z.string().describe("Full markdown content of the document"),
      },
    },
    async ({ id, content }) => {
      const result = await reader.addDocument(id, content);
      if (!result.success) {
        return {
          content: [{ type: "text" as const, text: `Error: ${result.error}` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: `Document "${id}" created successfully.` }],
      };
    }
  );
}
