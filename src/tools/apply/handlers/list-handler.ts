import type { ToolResult, ApplyActionHandler, ApplyActionContext } from "../../../types/index.js";
import { DRAFT_PREFIX, DRAFT_DIR } from "../../../constants.js";

export class ListHandler implements ApplyActionHandler {
  async execute(params: { context: ApplyActionContext }): Promise<ToolResult> {
    const { reader } = params.context;
    const { documents } = await reader.listDocuments({
      parentId: DRAFT_DIR,
      recursive: true,
    });
    if (documents.length === 0) {
      return {
        content: [
          { type: "text" as const, text: "No drafts available to promote." },
        ],
      };
    }
    const list = documents
      .map((d) => {
        const id = d.id.replace(DRAFT_PREFIX, "");
        return `- **${id}**: ${d.description}`;
      })
      .join("\n");
    return {
      content: [
        {
          type: "text" as const,
          text: `# Drafts Ready to Promote\n\n${list}\n\nUse \`apply(action: "promote", draftId: "<id>")\` to promote.`,
        },
      ],
    };
  }
}
