import type { ToolResult, DraftActionHandler, DraftActionContext } from "../../../types/index.js";
import { DRAFT_PREFIX, DRAFT_DIR } from "../../../constants.js";

export class ListHandler implements DraftActionHandler {
  async execute(params: { context: DraftActionContext }): Promise<ToolResult> {
    const { reader } = params.context;
    const { documents } = await reader.listDocuments({
      parentId: DRAFT_DIR,
      recursive: true,
    });
    if (documents.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: 'No drafts found. Use `draft(action: "add", id: "<id>", content: "<content>")` to create one.',
          },
        ],
      };
    }
    const list = documents
      .map((d) => `- **${d.id.replace(DRAFT_PREFIX, "")}**: ${d.description}`)
      .join("\n");
    return {
      content: [{ type: "text" as const, text: `# Drafts\n\n${list}` }],
    };
  }
}
