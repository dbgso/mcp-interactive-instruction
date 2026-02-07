import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MarkdownReader } from "../services/markdown-reader.js";

export function registerHelpTool(server: McpServer, reader: MarkdownReader): void {

  server.registerTool(
    "help",
    {
      description:
        "List markdown files or get content by ID. Without arguments, lists all available documents with summaries. With an ID, returns the full content of that document. Use this tool BEFORE starting any task to recall relevant instructions. When uncertain about a topic, check the summary list first to identify the relevant document, then load it to refresh your memory.",
      inputSchema: {
        id: z
          .string()
          .optional()
          .describe(
            "Document ID (filename without .md extension). Use '__' for hierarchy (e.g., 'git__workflow' for git/workflow.md). If ID is a category, lists its contents."
          ),
        recursive: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "If true, show all documents including nested ones. If false (default), show one level at a time with categories."
          ),
      },
    },
    async ({ id, recursive }) => {
      // If no ID, list documents at root level
      if (id === undefined || id === "") {
        const { documents, categories } = await reader.listDocuments(
          undefined,
          recursive
        );
        return {
          content: [
            {
              type: "text" as const,
              text: reader.formatDocumentList(documents, categories),
            },
          ],
        };
      }

      // Check if ID is a category (directory)
      const isCategory = await reader.isCategory(id);
      if (isCategory) {
        const { documents, categories } = await reader.listDocuments(
          id,
          recursive
        );
        return {
          content: [
            {
              type: "text" as const,
              text: reader.formatDocumentList(documents, categories),
            },
          ],
        };
      }

      // Try to get document content
      const content = await reader.getDocumentContent(id);
      if (content === null) {
        return {
          content: [
            { type: "text" as const, text: `Error: Document "${id}" not found.` },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: "text" as const, text: content }],
      };
    }
  );
}
