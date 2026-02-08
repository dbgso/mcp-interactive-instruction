import type { ToolResult, DraftActionHandler, DraftActionParams, DraftActionContext } from "../../../types/index.js";
import { DRAFT_PREFIX } from "../../../constants.js";

export class AddHandler implements DraftActionHandler {
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
            text: "Error: id and content are required for add action",
          },
        ],
        isError: true,
      };
    }
    const draftId = DRAFT_PREFIX + id;
    const result = await reader.addDocument({ id: draftId, content });
    if (!result.success) {
      return {
        content: [{ type: "text" as const, text: `Error: ${result.error}` }],
        isError: true,
      };
    }
    return {
      content: [
        { type: "text" as const, text: `Draft "${id}" created successfully.\nPath: ${result.path}` },
      ],
    };
  }
}
