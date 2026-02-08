# Test Patterns

## Use `.each` for Similar Test Cases

```typescript
// Good
it.each([
  { input: 1, expected: 2 },
  { input: 2, expected: 4 },
])("doubles $input to $expected", ({ input, expected }) => {
  expect(double(input)).toBe(expected);
});

// Bad - redundant
it("doubles 1 to 2", () => { expect(double(1)).toBe(2); });
it("doubles 2 to 4", () => { expect(double(2)).toBe(4); });
```
