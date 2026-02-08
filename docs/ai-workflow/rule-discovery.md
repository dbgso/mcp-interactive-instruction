# Rule Discovery Testing with Sub Agents

Method to verify if documentation rules are discoverable by AI agents.

## Purpose

Test whether rules can be found by AI before taking action. If agents fail to find a rule, the documentation structure may need improvement.

## Method

Launch multiple sub agents with the same task and analyze their behavior.

### Test Prompt Template

```
You are testing documentation discoverability. Your task:

1. Use `mcp__mcp-interactive-instruction__help` to check available documentation
2. Find the rule about: [TOPIC TO TEST]
3. Report:
   - What steps you took to find the rule
   - Whether you found the relevant rule
   - The rule content if found
   - Any difficulties encountered

Do NOT create or modify any files. This is a read-only discovery test.
```

### Example: Testing Language Rule Discoverability

```javascript
// Launch 3 agents in parallel
Task({
  prompt: `You are testing documentation discoverability. Your task:
    1. Use mcp__mcp-interactive-instruction__help to check documentation
    2. Find the rule about: what language to use for documentation
    3. Report what steps you took and whether you found the rule
    Do NOT create or modify any files.`,
  subagent_type: "general-purpose",
  run_in_background: true
})
```

## Analysis Criteria

| Result | Meaning |
|--------|---------|
| All agents found rule | Rule is discoverable ✓ |
| Some agents missed | Rule location may be unclear |
| No agents found | Rule needs better placement or naming |

## When to Use

- After creating new rules
- When reorganizing documentation structure
- Before promoting drafts to confirmed docs
- When agents repeatedly miss certain rules
