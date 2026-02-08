import type { ToolResult, ApplyActionHandler, ApplyActionParams, ApplyActionContext } from "../../../types/index.js";
import { DRAFT_PREFIX } from "../../../constants.js";

export class PromoteHandler implements ApplyActionHandler {
  async execute(params: {
    actionParams: ApplyActionParams;
    context: ApplyActionContext;
  }): Promise<ToolResult> {
    const { draftId, targetId } = params.actionParams;
    const { reader } = params.context;

    if (!draftId) {
      return {
        content: [
          {
            type: "text" as const,
            text: "Error: draftId is required for promote action",
          },
        ],
        isError: true,
      };
    }

    const sourceDraftId = DRAFT_PREFIX + draftId;
    const finalTargetId = targetId || draftId;

    const draftContent = await reader.getDocumentContent(sourceDraftId);
    if (draftContent === null) {
      return {
        content: [
          { type: "text" as const, text: `Error: Draft "${draftId}" not found.` },
        ],
        isError: true,
      };
    }

    const renameResult = await reader.renameDocument({
      oldId: sourceDraftId,
      newId: finalTargetId,
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
          text: `Draft "${draftId}" promoted to "${finalTargetId}" successfully.`,
        },
      ],
    };
  }
}
