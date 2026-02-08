# Coding Rules

This project's coding conventions and rules.

## Function/Method Arguments

All custom functions and methods should use params object style:

```typescript
// Good
function createServer(params: { markdownDir: string; config: ReminderConfig }): McpServer

// Bad
function createServer(markdownDir: string, config: ReminderConfig): McpServer
```

This makes the call site more readable and allows for easier extension.
