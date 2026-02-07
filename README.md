# mcp-interactive-instruction

MCP server for interactive instruction documents. Enables AI agents to list, view, add, and update markdown files on demand instead of loading all documentation at once.

## Features

- **help**: List all documents with summaries, or get full content by ID
- **add**: Create new markdown documents
- **update**: Update existing markdown documents

## Installation

```bash
npm install -g mcp-interactive-instruction
```

Or use directly with npx:

```bash
npx mcp-interactive-instruction /path/to/docs
```

## Usage

### Claude Code Configuration

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "docs": {
      "command": "npx",
      "args": ["-y", "mcp-interactive-instruction", "/path/to/your/docs"]
    }
  }
}
```

Or for a specific project, create `.mcp.json` in the project root:

```json
{
  "mcpServers": {
    "docs": {
      "command": "npx",
      "args": ["-y", "mcp-interactive-instruction", "./docs"]
    }
  }
}
```

### Tools

#### help

List all documents or get content by ID.

```
# List all documents
help({})
→ Available documents:
  - agents: Description of agents...
  - skills: Description of skills...

# Get specific document
help({ id: "agents" })
→ (full content of agents.md)
```

#### add

Create a new markdown document.

```
add({ id: "new-guide", content: "# New Guide\n\nContent here..." })
→ Document "new-guide" created successfully.
```

#### update

Update an existing document.

```
update({ id: "agents", content: "# Agents (Updated)\n\nNew content..." })
→ Document "agents" updated successfully.
```

## Document Format

Documents should have this structure for best results:

```markdown
# Title

Summary paragraph that appears in the document list.

## Section 1

Content...
```

The first paragraph after the `# Title` heading is used as the summary in the document list.

## License

MIT
