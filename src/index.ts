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

  const positional = args.filter((arg) => !arg.startsWith("--"));

  if (positional.length === 0) {
    console.error(
      "Usage: mcp-interactive-instruction <markdown-directory> [--remind-mcp] [--remind-organize]"
    );
    process.exit(1);
  }

  return {
    markdownDir: positional[0],
    config: { remindMcp, remindOrganize },
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
