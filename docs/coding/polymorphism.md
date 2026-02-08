# Multi-Action Tools Pattern

When a single tool provides multiple actions, use polymorphism (strategy/handler pattern) instead of if-else chains.

## Pattern

```typescript
// Good - Handler map pattern
const handlers: Record<Action, ActionHandler> = {
  list: new ListHandler(),
  add: new AddHandler(),
  delete: new DeleteHandler(),
};
await handlers[action].execute(params);

// Bad - if-else chain
if (action === "list") { ... }
else if (action === "add") { ... }
else if (action === "delete") { ... }
```
