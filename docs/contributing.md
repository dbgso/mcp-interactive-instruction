# Contributing

Guidelines for contributing to mcp-interactive-instruction.

## Dependency Rules

- **No caret (^) versions** - Always use exact versions when adding dependencies
  ```bash
  # Good
  pnpm add zod@3.25.76

  # Bad - will add ^3.25.76
  pnpm add zod
  ```

## Development Setup

```bash
pnpm install
pnpm build
pnpm test
```

## Commit Convention

Use conventional commits for semantic-release:

| Prefix | Description | Version Bump |
|--------|-------------|--------------|
| feat:  | New feature | minor |
| fix:   | Bug fix     | patch |
| feat!: | Breaking change | major |
| docs:  | Documentation | none |
| chore: | Maintenance | none |

## Testing

Run tests with:
```bash
pnpm test        # single run
pnpm test:watch  # watch mode
```

### Test Style Rules

- **Always use `it.each` for grouped tests** - When testing similar cases, use parameterized tests
- Keep test data as arrays or objects for readability

```typescript
// Good
it.each([
  ["case1", expected1],
  ["case2", expected2],
])("should handle %s", async (input, expected) => {
  expect(result).toBe(expected);
});

// Avoid: separate tests for similar cases
it("should handle case1", ...);
it("should handle case2", ...);
```

## Release

Releases are automated via semantic-release. No manual versioning needed.

### Initial Setup (once)

1. Create GitHub repository
2. Add remote: `git remote add origin https://github.com/USER/mcp-interactive-instruction.git`
3. Add NPM token to GitHub Secrets:
   - Go to npmjs.com → Access Tokens → Generate (Automation)
   - Go to GitHub → Settings → Secrets → Actions → Add `NPM_TOKEN`

### Release Flow

```bash
# 1. Commit with conventional commit format
git commit -m "feat: add new feature"

# 2. Push to main
git push origin main

# 3. GitHub Actions automatically:
#    - Determines version from commits
#    - Publishes to npm
#    - Creates GitHub Release
```

### Version Bumps

| Commit | Example Version Change |
|--------|----------------------|
| fix:   | 0.0.1 → 0.0.2 |
| feat:  | 0.1.0 → 0.2.0 |
| feat!: | 0.2.0 → 1.0.0 |

## Pull Requests

1. Create feature branch
2. Write tests
3. Ensure CI passes
4. Submit PR
