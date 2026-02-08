import type { ToolResult, DraftActionHandler, DraftActionParams, DraftActionContext } from "../../../types/index.js";
import { DRAFT_PREFIX } from "../../../constants.js";

export class UpdateHandler implements DraftActionHandler {
  async execute(params: {
    actionParams: DraftActionParams;
    context: DraftActionContext;
  }): Promise<ToolResult> {
    const { id, content } = params.actionParams;
    const { reader } = params.context;

    if (!id || !content) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: id and content are required for update action",
          },
        ],
        isError: true,
      };
    }
    const draftId = DRAFT_PREFIX + id;
    const result = await reader.updateDocument({ id: draftId, content });
    if (!result.success) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${result.error}`,
          },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: `Draft "${id}" updated successfully.\nPath: ${result.path}\n\n[AI Action Required] Explain the updated content to the user and confirm it matches their intent.`,
        },
      ],
    };
  }
}
