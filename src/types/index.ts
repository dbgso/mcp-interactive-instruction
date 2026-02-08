import type { MarkdownReader } from "../services/markdown-reader.js";

export interface MarkdownSummary {
  id: string;
  description: string;
}

export interface ReminderConfig {
  remindMcp: boolean;
  remindOrganize: boolean;
  customReminders: string[];
  topicForEveryTask: string | null;
  infoValidSeconds: number;
}

export type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

export interface ActionHandler<TParams, TContext> {
  execute(params: {
    actionParams: TParams;
    context: TContext;
  }): Promise<ToolResult>;
}

// Draft tool types
export interface DraftActionParams {
  id?: string;
  content?: string;
  newId?: string;
}

export interface DraftActionContext {
  reader: MarkdownReader;
  config: ReminderConfig;
}

export type DraftActionHandler = ActionHandler<DraftActionParams, DraftActionContext>;

// Apply tool types
export interface ApplyActionParams {
  draftId?: string;
  targetId?: string;
}

export interface ApplyActionContext {
  reader: MarkdownReader;
  config: ReminderConfig;
}

export type ApplyActionHandler = ActionHandler<ApplyActionParams, ApplyActionContext>;
