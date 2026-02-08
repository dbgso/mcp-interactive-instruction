import type { ToolResult, DraftActionHandler, DraftActionParams, DraftActionContext } from "../../../types/index.js";
import { DRAFT_PREFIX } from "../../../constants.js";

export class DeleteHandler implements DraftActionHandler {
  async execute(params: {
    actionParams: DraftActionParams;
    context: DraftActionContext;
  }): Promise<ToolResult> {
    const { id } = params.actionParams;
    const { reader } = params.context;

    if (!id) {
      return {
        content: [
          { type: "text" as const, text: "Error: id is required for delete action" },
        ],
        isError: true,
      };
    }
    const draftId = DRAFT_PREFIX + id;
    const deleteResult = await reader.deleteDocument(draftId);
    if (!deleteResult.success) {
      return {
        content: [
          { type: "text" as const, text: `Error: ${deleteResult.error}` },
        ],
        isError: true,
      };
    }
    return {
      content: [
        { type: "text" as const, text: `Draft "${id}" deleted successfully.` },
      ],
    };
  }
}
