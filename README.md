# mcp-interactive-instruction

MCP server for interactive instruction documents. Enables AI agents to list, view, add, and update markdown files on demand instead of loading all documentation at once.

## Why

Traditional approach of loading large .md files (like `agents.md`, `skills.md`) at the start of a conversation has limitations:

- **Context bloat**: All documentation occupies context space even when not needed
- **Forgetting**: As conversation grows, AI gradually "forgets" earlier loaded content
- **All or nothing**: No way to selectively refresh specific information

This tool solves these problems by:

- **Topic-based splitting**: Organize documentation into separate files by topic
- **On-demand retrieval**: Fetch only what's needed, when it's needed
- **Interactive recall**: AI can "remember" information by querying the MCP tool

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

The first paragraph after the `# Title` heading is used as the summary in the document list. **Make this summary descriptive enough for AI to identify when this document is relevant.**

### Granularity Guidelines

Keep each document focused on **ONE topic** for maximum reusability:

| Instead of | Split into |
|------------|------------|
| `git.md` (everything about git) | `git-workflow.md` (process/flow) + `git-commands.md` (specific syntax) |
| `api.md` (all API docs) | `api-overview.md` (architecture) + `api-endpoints.md` (reference) |
| `coding.md` (all conventions) | `naming.md` + `error-handling.md` + `testing.md` |

**Why this matters:**
- AI can load only what's needed (e.g., forgot a command? load just `git-commands.md`)
- Summaries become more specific and easier to match
- Updates to one aspect don't require reloading unrelated content

## Example: Organizing AI Instructions

Split your instruction files by topic:

```
docs/
├── agents.md       # Agent behavior and capabilities
├── skills.md       # Available skills and how to use them
├── coding-style.md # Code formatting and conventions
├── git-workflow.md # Commit message format, branch naming
└── project.md      # Project-specific context
```

Example `.mcp.json` for a project:

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

### Recommended Workflow

**Important**: Always check the MCP tool before starting any task.

```
# At the start of each task, check available documentation
help({})

# Load relevant docs for the current task
help({ id: "coding-style" })  # Before writing code
help({ id: "git-workflow" })  # Before committing
```

This ensures the AI always has fresh context for the specific task at hand, rather than relying on potentially "forgotten" information from earlier in the conversation.

## License

MIT
