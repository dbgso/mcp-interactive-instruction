# mcp-interactive-instruction

MCP server for interactive instruction documents. Enables AI agents to autonomously manage documentation - creating drafts, organizing knowledge, and promoting to confirmed docs with user approval.

## Why

Traditional approach of loading large .md files (like `agents.md`, `skills.md`) at the start of a conversation has limitations:

- **Context bloat**: All documentation occupies context space even when not needed
- **Forgetting**: As conversation grows, AI gradually "forgets" earlier loaded content
- **All or nothing**: No way to selectively refresh specific information
- **Static knowledge**: AI can't record new learnings from the conversation

This tool solves these problems by:

- **Topic-based splitting**: Organize documentation into separate files by topic
- **On-demand retrieval**: Fetch only what's needed, when it's needed
- **Interactive recall**: AI can "remember" information by querying the MCP tool
- **Autonomous learning**: AI can record new knowledge as drafts without permission
- **Human oversight**: Drafts require approval before becoming confirmed docs

## Tools

| Tool | Purpose | Permission |
|------|---------|------------|
| `description` | Show usage instructions for all tools | - |
| `help` | Browse/read confirmed documentation | - |
| `draft` | CRUD for temporary docs (`_mcp_drafts/`) | AI can use freely |
| `apply` | Promote drafts to confirmed docs | Requires user approval |

### description

Show detailed usage instructions for all MCP tools.

```
description()
→ Full usage guide with examples
```

### help

Browse and read confirmed documentation. Drafts (`_mcp_drafts/`) are automatically filtered out.

```
# List root level (shows categories and documents)
help()

# Navigate into a category
help({ id: "git" })

# Get specific document content
help({ id: "git__workflow" })

# List ALL documents at once (flat view)
help({ recursive: true })
```

### draft

Manage temporary documentation drafts. **AI should use this freely** to record any new information learned from user instructions.

```
# Show draft tool help
draft()

# List all drafts
draft({ action: "list" })

# Read a draft
draft({ action: "read", id: "coding__style" })

# Create new draft (NEW topic = NEW file!)
draft({ action: "add", id: "coding__testing", content: "# Testing Rules\n\n..." })

# Update existing draft (same topic only)
draft({ action: "update", id: "coding__testing", content: "# Testing Rules\n\nUpdated..." })

# Delete a draft
draft({ action: "delete", id: "old-draft" })

# Rename/move a draft (safe reorganization)
draft({ action: "rename", id: "old-name", newId: "category__new-name" })
```

**Important Rules for AI:**
- **New information = New file**: Different topic = always use `add`, not `update`
- **One topic per file**: Keep each draft focused on a single topic
- **Use hierarchy**: Group related topics with prefixes (e.g., `coding__testing`)

### apply

Promote drafts to confirmed documentation. This requires user approval.

```
# Show apply tool help
apply()

# List drafts ready to promote
apply({ action: "list" })

# Promote a draft (same name)
apply({ action: "promote", draftId: "coding-style" })
→ Moves _mcp_drafts/coding-style.md to coding-style.md

# Promote with different name/location
apply({ action: "promote", draftId: "temp-guide", targetId: "guides__setup" })
→ Moves _mcp_drafts/temp-guide.md to guides/setup.md
```

## Installation

```bash
npm install -g mcp-interactive-instruction
```

Or use directly with npx:

```bash
npx mcp-interactive-instruction /path/to/docs
```

## Configuration

### Claude Code

Add to `~/.claude/settings.json` for global configuration:

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

Or create `.mcp.json` in your project root:

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

### Reminder Flags (Optional)

Optionally add flags to help AI remember to use the MCP tools:

```json
{
  "mcpServers": {
    "docs": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-interactive-instruction",
        "./docs",
        "--remind-mcp",
        "--remind-organize",
        "--reminder", "Always check tests before committing"
      ]
    }
  }
}
```

| Flag | Effect |
|------|--------|
| `--remind-mcp` | Reminds AI to check docs before starting tasks |
| `--remind-organize` | Reminds AI to keep docs organized (1 topic per file) |
| `--reminder <message>` | Add custom reminder message (can be used multiple times) |

Example with multiple custom reminders:

```json
{
  "args": [
    "-y",
    "mcp-interactive-instruction",
    "./docs",
    "--reminder", "Run tests after code changes",
    "--reminder", "Use Japanese for commit messages"
  ]
}
```

## Directory Structure

```
docs/
├── coding-style.md              → id: "coding-style" (confirmed)
├── git/
│   ├── workflow.md              → id: "git__workflow" (confirmed)
│   └── commands.md              → id: "git__commands" (confirmed)
└── _mcp_drafts/                 ← AI's temporary drafts
    ├── new-feature.md           → draft id: "new-feature"
    └── coding/
        └── testing.md           → draft id: "coding__testing"
```

- **Confirmed docs**: Root level and subdirectories (excluding `_mcp_drafts/`)
- **Drafts**: Stored in `_mcp_drafts/` directory
- **ID Format**: Use `__` (double underscore) as the path separator

## Workflow

### For AI

1. **Check docs before tasks**: Use `help()` to see available documentation
2. **Record new learnings**: When user teaches something new, immediately create a draft
3. **One topic per file**: Keep drafts focused and granular
4. **Ask before promoting**: Get user approval before using `apply`

```
# User says: "Always use params object style for function arguments"
draft({ action: "add", id: "coding__params-style", content: "# Params Style\n\n..." })

# Later, ask user: "Should I promote this to confirmed docs?"
apply({ action: "promote", draftId: "coding__params-style" })
```

### For Users

1. **Review drafts**: Check `draft({ action: "list" })` to see what AI has recorded
2. **Approve or reject**: Decide which drafts should become permanent documentation
3. **Organize**: Use `apply` with `targetId` to place docs in the right location

## Document Format

```markdown
# Title

Summary paragraph that appears in the document list.

## Section 1

Content...
```

The first paragraph after the `# Title` heading is used as the summary in listings. **Make summaries descriptive** so AI can identify when each document is relevant.

### Granularity Guidelines

Keep each document focused on **ONE topic**:

| Instead of | Split into |
|------------|------------|
| `git.md` (everything) | `git__workflow.md` + `git__commands.md` |
| `coding.md` (all rules) | `coding__style.md` + `coding__testing.md` |

**Why this matters:**
- AI loads only what's needed
- Easier to find and update specific information
- Better summaries for matching

## Performance

- **Caching**: Document list cached for 1 minute
- **Cache invalidation**: Automatic on write operations
- **Lazy loading**: Documents read only when requested

## License

MIT
