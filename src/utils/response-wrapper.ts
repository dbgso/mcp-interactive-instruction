import type { ReminderConfig } from "../types/index.js";

interface ToolResult {
  [x: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

const MCP_REMINDER = `[Reminder] Always refer to this MCP to check for relevant documentation before starting any task. Use the 'help' tool to list available documents.`;

const ORGANIZE_REMINDER = `[Reminder] Review document organization: Use directory hierarchy for related topics. Each file should cover ONE topic only - don't write detailed blocks, instead link to separate topic documents.`;

export function wrapResponse(params: {
  result: ToolResult;
  config: ReminderConfig;
}): ToolResult {
  const { result, config } = params;
  if (!config.remindMcp && !config.remindOrganize) {
    return result;
  }

  const reminders: string[] = [];
  if (config.remindMcp) {
    reminders.push(MCP_REMINDER);
  }
  if (config.remindOrganize) {
    reminders.push(ORGANIZE_REMINDER);
  }

  const reminderBlock = `\n\n---\n\n${reminders.join("\n\n")}`;

  return {
    ...result,
    content: result.content.map((item) => ({
      ...item,
      text: item.text + reminderBlock,
    })),
  };
}
