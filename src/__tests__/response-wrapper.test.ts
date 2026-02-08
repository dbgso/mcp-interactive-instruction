import { describe, it, expect } from "vitest";
import { buildReminderBlock } from "../utils/response-wrapper.js";
import type { ReminderConfig } from "../types/index.js";

describe("buildReminderBlock", () => {
  it.each<{
    name: string;
    config: ReminderConfig;
    expected: string[] | null;
  }>([
    {
      name: "returns null when no reminders configured",
      config: { remindMcp: false, remindOrganize: false, customReminders: [] },
      expected: null,
    },
    {
      name: "includes MCP reminder only",
      config: { remindMcp: true, remindOrganize: false, customReminders: [] },
      expected: ["Always refer to this MCP", "help"],
    },
    {
      name: "includes organize reminder only",
      config: { remindMcp: false, remindOrganize: true, customReminders: [] },
      expected: ["Review document organization", "ONE topic only"],
    },
    {
      name: "includes both built-in reminders",
      config: { remindMcp: true, remindOrganize: true, customReminders: [] },
      expected: ["Always refer to this MCP", "Review document organization"],
    },
    {
      name: "includes single custom reminder with prefix",
      config: { remindMcp: false, remindOrganize: false, customReminders: ["Run tests"] },
      expected: ["[Reminder] Run tests"],
    },
    {
      name: "includes multiple custom reminders",
      config: { remindMcp: false, remindOrganize: false, customReminders: ["First", "Second"] },
      expected: ["[Reminder] First", "[Reminder] Second"],
    },
    {
      name: "combines all reminder types",
      config: { remindMcp: true, remindOrganize: true, customReminders: ["Custom"] },
      expected: ["Always refer to this MCP", "Review document organization", "[Reminder] Custom"],
    },
  ])("$name", ({ config, expected }) => {
    const result = buildReminderBlock({ config });

    if (expected === null) {
      expect(result).toBeNull();
    } else {
      expect(result).not.toBeNull();
      for (const text of expected) {
        expect(result).toContain(text);
      }
    }
  });

  it("starts with separator when reminders exist", () => {
    const result = buildReminderBlock({
      config: { remindMcp: true, remindOrganize: false, customReminders: [] },
    });

    expect(result).toMatch(/^\n\n---\n\n/);
  });
});
