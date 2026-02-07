import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MarkdownReader } from "../services/markdown-reader.js";

export function registerHelpTool(server: McpServer, markdownDir: string): void {
  const reader = new MarkdownReader(markdownDir);

  server.registerTool(
    "help",
    {
      description: "List markdown files or get content by ID. Without arguments, lists all available documents with summaries. With an ID, returns the full content of that document. Use this tool BEFORE starting any task to recall relevant instructions. When uncertain about a topic, check the summary list first to identify the relevant document, then load it to refresh your memory.",
      inputSchema: {
        id: z
          .string()
          .optional()
          .describe("Document ID (filename without .md extension)"),
      },
    },
    async ({ id }) => {
      if (id === undefined || id === "") {
        const summaries = await reader.listDocuments();
        return {
          content: [{ type: "text" as const, text: reader.formatDocumentList(summaries) }],
        };
      }

      const content = await reader.getDocumentContent(id);
      if (content === null) {
        return {
          content: [{ type: "text" as const, text: `Error: Document "${id}" not found.` }],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: content }],
      };
    }
  );
}
