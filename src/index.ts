#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import type { ReminderConfig } from "./types/index.js";

function parseArgs(params: { args: string[] }): {
  markdownDir: string;
  config: ReminderConfig;
} {
  const { args } = params;
  const remindMcp = args.includes("--remind-mcp");
  const remindOrganize = args.includes("--remind-organize");

  // Parse --reminder "message" flags (can appear multiple times)
  const customReminders: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--reminder" && i + 1 < args.length) {
      customReminders.push(args[i + 1]);
      i++; // Skip the next arg (the message)
    }
  }

  // Filter out flags and their values to get positional args
  const positional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--reminder") {
      i++; // Skip the message value
    } else if (!args[i].startsWith("--")) {
      positional.push(args[i]);
    }
  }

  if (positional.length === 0) {
    console.error(
      "Usage: mcp-interactive-instruction <markdown-directory> [--remind-mcp] [--remind-organize] [--reminder <message>]..."
    );
    process.exit(1);
  }

  return {
    markdownDir: positional[0],
    config: { remindMcp, remindOrganize, customReminders },
  };
}

async function main() {
  const args = process.argv.slice(2);
  const { markdownDir, config } = parseArgs({ args });

  const server = createServer({ markdownDir, config });
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
