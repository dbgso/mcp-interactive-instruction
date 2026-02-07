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
- **Hierarchical organization**: Support for nested directories with progressive navigation

## Features

- **help**: List documents/categories or get content by ID (supports hierarchical navigation)
- **add**: Create new markdown documents (supports nested paths)
- **update**: Update existing markdown documents
- **delete**: Remove documents (cleans up empty directories)
- **rename**: Rename or move documents to different paths
- **Caching**: 1-minute cache for performance, auto-invalidated on write operations

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

List documents/categories or get content by ID.

```
# List root level (shows categories and root documents)
help({})
→ Available documents:

  **Categories:**
  - **git/** (3 docs)
  - **api/** (2 docs)

  **Documents:**
  - **coding-style**: Code formatting conventions...

# Navigate into a category
help({ id: "git" })
→ Available documents:
  - **git__workflow**: Git workflow process...
  - **git__commands**: Common git commands...
  - **git__branching**: Branch naming conventions...

# Get specific document content
help({ id: "git__workflow" })
→ (full content of git/workflow.md)

# List ALL documents at once (flat view)
help({ recursive: true })
→ All documents listed regardless of hierarchy
```

#### add

Create a new markdown document. Use `__` for nested paths.

```
# Create at root level
add({ id: "new-guide", content: "# New Guide\n\nContent here..." })
→ Document "new-guide" created successfully.

# Create in subdirectory (creates git/advanced.md)
add({ id: "git__advanced", content: "# Advanced Git\n\nAdvanced topics..." })
→ Document "git__advanced" created successfully.
```

#### update

Update an existing document.

```
update({ id: "git__workflow", content: "# Git Workflow (Updated)\n\nNew content..." })
→ Document "git__workflow" updated successfully.
```

#### delete

Delete a document. Empty parent directories are automatically cleaned up.

```
delete({ id: "git__old-doc" })
→ Document "git__old-doc" deleted successfully.
```

#### rename

Rename or move a document to a different path.

```
# Rename within same directory
rename({ oldId: "guide", newId: "tutorial" })
→ Document renamed from "guide" to "tutorial" successfully.

# Move to different category
rename({ oldId: "misc__doc", newId: "git__doc" })
→ Document renamed from "misc__doc" to "git__doc" successfully.
```

## Directory Structure

Documents can be organized in nested directories:

```
docs/
├── coding-style.md          → id: "coding-style"
├── git/
│   ├── workflow.md          → id: "git__workflow"
│   ├── commands.md          → id: "git__commands"
│   └── advanced/
│       └── rebase.md        → id: "git__advanced__rebase"
└── api/
    ├── overview.md          → id: "api__overview"
    └── endpoints.md         → id: "api__endpoints"
```

**ID Format**: Use `__` (double underscore) as the path separator.

### Progressive Navigation vs Flat View

| Mode | Command | Use Case |
|------|---------|----------|
| Progressive | `help({})` then `help({ id: "git" })` | Browse categories step by step |
| Flat | `help({ recursive: true })` | See everything at once |

Progressive navigation is useful when you have many documents and want to explore by category. Flat view is useful when you want to quickly find a specific document.

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
| `git.md` (everything about git) | `git/workflow.md` + `git/commands.md` |
| `api.md` (all API docs) | `api/overview.md` + `api/endpoints.md` |
| `coding.md` (all conventions) | `naming.md` + `error-handling.md` + `testing.md` |

**Why this matters:**
- AI can load only what's needed (e.g., forgot a command? load just `git__commands`)
- Summaries become more specific and easier to match
- Updates to one aspect don't require reloading unrelated content

## Example: Organizing AI Instructions

```
docs/
├── overview.md         # High-level project context
├── coding/
│   ├── style.md        # Code formatting conventions
│   ├── naming.md       # Naming conventions
│   └── testing.md      # Testing guidelines
├── git/
│   ├── workflow.md     # Git workflow process
│   └── commands.md     # Specific command reference
└── api/
    ├── overview.md     # API architecture
    └── endpoints.md    # Endpoint reference
```

### Recommended Workflow

**Important**: Always check the MCP tool before starting any task.

```
# At the start of each task, check available documentation
help({})

# Navigate to relevant category
help({ id: "coding" })

# Load specific doc for the task
help({ id: "coding__style" })  # Before writing code
help({ id: "git__workflow" })  # Before committing
```

This ensures the AI always has fresh context for the specific task at hand, rather than relying on potentially "forgotten" information from earlier in the conversation.

## Performance

- **Caching**: Document list is cached for 1 minute to avoid repeated filesystem scans
- **Cache invalidation**: Cache is automatically cleared when documents are added or updated
- **Lazy loading**: Documents are only read when specifically requested

## License

MIT
