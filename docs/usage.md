# Usage

How to use mcp-interactive-instruction in your projects.

## Installation

```bash
npm install -g mcp-interactive-instruction
# or use with npx
npx mcp-interactive-instruction /path/to/docs
```

## Configuration

### Global (all projects)
Add to `~/.claude/settings.json`:
```json
{
  "mcpServers": {
    "docs": {
      "command": "npx",
      "args": ["-y", "mcp-interactive-instruction", "~/.claude/docs"]
    }
  }
}
```

### Per-project
Create `.mcp.json` in project root:
```json
{
  "mcpServers": {
    "docs": {
      "command": "node",
      "args": ["./node_modules/mcp-interactive-instruction/dist/index.js", "./docs"]
    }
  }
}
```

## Tools

### help
```
help()           → List all documents
help({id:"foo"}) → Get content of foo.md
```

### add
```
add({id:"new", content:"# New\n\nContent"})
```

### update
```
update({id:"existing", content:"# Updated\n\nNew content"})
```
