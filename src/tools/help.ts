import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MarkdownReader } from "../services/markdown-reader.js";
import { wrapResponse } from "../utils/response-wrapper.js";
import type { ReminderConfig } from "../types/index.js";
import { DRAFT_DIR } from "../constants.js";

export function registerHelpTool(params: {
  server: McpServer;
  reader: MarkdownReader;
  config: ReminderConfig;
}): void {
  const { server, reader, config } = params;
  server.registerTool(
    "help",
    {
      description:
        "List markdown files or get content by ID. Without arguments, lists all available documents with summaries. With an ID, returns the full content of that document. Use this tool BEFORE starting any task to recall relevant instructions. When uncertain about a topic, check the summary list first to identify the relevant document, then load it to refresh your memory. This shows confirmed docs only - use 'draft' tool for temporary drafts.",
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
      // Helper to filter out drafts
      const filterDrafts = (result: {
        documents: { id: string; description: string }[];
        categories: { id: string; docCount: number }[];
      }) => ({
        documents: result.documents.filter(
          (d) => !d.id.startsWith(DRAFT_DIR)
        ),
        categories: result.categories.filter((c) => c.id !== DRAFT_DIR),
      });

      // If no ID, list documents at root level
      if (id === undefined || id === "") {
        const result = await reader.listDocuments({ recursive });
        const { documents, categories } = filterDrafts(result);
        return wrapResponse({
          result: {
            content: [
              {
                type: "text" as const,
                text: reader.formatDocumentList({ documents, categories }),
              },
            ],
          },
          config,
        });
      }

      // Check if ID is a category (directory)
      const isCategory = await reader.isCategory(id);
      if (isCategory) {
        const result = await reader.listDocuments({ parentId: id, recursive });
        const { documents, categories } = filterDrafts(result);
        return wrapResponse({
          result: {
            content: [
              {
                type: "text" as const,
                text: reader.formatDocumentList({ documents, categories }),
              },
            ],
          },
          config,
        });
      }

      // Try to get document content
      const content = await reader.getDocumentContent(id);
      if (content === null) {
        return wrapResponse({
          result: {
            content: [
              {
                type: "text" as const,
                text: `Error: Document "${id}" not found.`,
              },
            ],
            isError: true,
          },
          config,
        });
      }
      return wrapResponse({
        result: {
          content: [{ type: "text" as const, text: content }],
        },
        config,
      });
    }
  );
}
