# Concept

MCP server that enables AI agents to autonomously manage documentation.

## Problems with Traditional Approach

Loading large .md files at conversation start has limitations:

- **Context bloat**: All documentation occupies context space even when not needed
- **Forgetting**: As conversation grows, AI gradually "forgets" earlier loaded content
- **All or nothing**: No way to selectively refresh specific information
- **Static knowledge**: AI can't record new learnings from the conversation

## Solutions

### Topic-based Splitting
One topic = one file. Fetch only what's needed, when it's needed.

### On-demand Retrieval
Use `help` tool to retrieve documents as needed. Saves context space.

### Interactive Recall
AI can "remember" information by querying the MCP tool.

### Autonomous Learning
AI can freely record new knowledge as drafts. No permission required.

### Human Oversight
Promoting drafts to confirmed docs requires user approval.

## Workflow

```
User teaches → AI creates draft → User approves → Promoted to confirmed doc
```

This allows AI to "learn" and accumulate project-specific knowledge.
