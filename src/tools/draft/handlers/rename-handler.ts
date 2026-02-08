import type { ToolResult, DraftActionHandler, DraftActionParams, DraftActionContext } from "../../../types/index.js";
import { DRAFT_PREFIX } from "../../../constants.js";

export class RenameHandler implements DraftActionHandler {
  async execute(params: {
    actionParams: DraftActionParams;
    context: DraftActionContext;
  }): Promise<ToolResult> {
    const { id, newId } = params.actionParams;
    const { reader } = params.context;

    if (!id || !newId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: id and newId are required for rename action",
          },
        ],
        isError: true,
      };
    }
    const oldDraftId = DRAFT_PREFIX + id;
    const newDraftId = DRAFT_PREFIX + newId;
    const renameResult = await reader.renameDocument({
      oldId: oldDraftId,
      newId: newDraftId,
    });
    if (!renameResult.success) {
      return {
        content: [
          { type: "text" as const, text: `Error: ${renameResult.error}` },
        ],
        isError: true,
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: `Draft renamed from "${id}" to "${newId}" successfully.`,
        },
      ],
    };
  }
}
