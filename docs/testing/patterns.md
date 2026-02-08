# Test Patterns

Guidelines for writing consistent and maintainable tests.

## Use `.each` for Similar Test Cases

When multiple tests follow the same pattern (call function with config, check result), use `.each`.

### Simple example

```typescript
it.each([
  { input: 1, expected: 2 },
  { input: 2, expected: 4 },
])("doubles $input to $expected", ({ input, expected }) => {
  expect(double(input)).toBe(expected);
});
```

### Config/flag combinations

When testing different config combinations with expected outputs:

```typescript
// Good - use .each for config variations
it.each<{
  name: string;
  config: ReminderConfig;
  expected: string[] | null;
}>([
  {
    name: "returns null when disabled",
    config: { flagA: false, flagB: false },
    expected: null,
  },
  {
    name: "includes A when flagA is true",
    config: { flagA: true, flagB: false },
    expected: ["content from A"],
  },
  {
    name: "includes both when both flags true",
    config: { flagA: true, flagB: true },
    expected: ["content from A", "content from B"],
  },
])("$name", ({ config, expected }) => {
  const result = buildSomething({ config });
  if (expected === null) {
    expect(result).toBeNull();
  } else {
    for (const text of expected) {
      expect(result).toContain(text);
    }
  }
});

// Bad - repetitive individual tests
it("returns null when disabled", () => { ... });
it("includes A when flagA is true", () => { ... });
it("includes both when both flags true", () => { ... });
```

### When NOT to use `.each`

- Tests with completely different logic/assertions
- Tests that require unique setup/teardown
- Single edge case tests