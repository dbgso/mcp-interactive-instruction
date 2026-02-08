import type { ToolResult, DraftActionHandler, DraftActionParams, DraftActionContext } from "../../../types/index.js";
import { DRAFT_PREFIX } from "../../../constants.js";

export class ReadHandler implements DraftActionHandler {
  async execute(params: {
    actionParams: DraftActionParams;
    context: DraftActionContext;
  }): Promise<ToolResult> {
    const { id } = params.actionParams;
    const { reader } = params.context;

    if (!id) {
      return {
        content: [
          { type: "text" as const, text: "Error: id is required for read action" },
        ],
        isError: true,
      };
    }
    const draftId = DRAFT_PREFIX + id;
    const docContent = await reader.getDocumentContent(draftId);
    if (docContent === null) {
      return {
        content: [
          { type: "text" as const, text: `Error: Draft "${id}" not found.` },
        ],
        isError: true,
      };
    }
    return {
      content: [{ type: "text" as const, text: docContent }],
    };
  }
}
