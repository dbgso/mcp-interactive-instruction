import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { MarkdownReader } from "../services/markdown-reader.js";

export function registerAddTool(server: McpServer, reader: MarkdownReader): void {

  server.registerTool(
    "add",
    {
      description: "Add a new markdown document. The ID becomes the filename (without .md extension). Keep each document focused on ONE topic for reusability. Separate overview/flow documents from specific command references. Example: 'git-workflow' for the process, 'git-commands' for specific command syntax. This allows targeted recall without loading unrelated content.",
      inputSchema: {
        id: z
          .string()
          .describe(
            "Document ID. Use '__' for hierarchy (e.g., 'git__workflow' creates git/workflow.md)"
          ),
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
