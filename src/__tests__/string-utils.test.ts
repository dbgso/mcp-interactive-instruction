import { describe, it, expect } from "vitest";
import { trimString } from "../utils/string-utils.js";

describe("trimString", () => {
  it.each<{
    name: string;
    value: string;
    collapseSpaces?: boolean;
    expected: string;
  }>([
    {
      name: "trims leading whitespace",
      value: "   hello",
      expected: "hello",
    },
    {
      name: "trims trailing whitespace",
      value: "hello   ",
      expected: "hello",
    },
    {
      name: "trims both leading and trailing whitespace",
      value: "   hello   ",
      expected: "hello",
    },
    {
      name: "returns empty string when only whitespace",
      value: "     ",
      expected: "",
    },
    {
      name: "preserves internal spaces by default",
      value: "  hello   world  ",
      expected: "hello   world",
    },
    {
      name: "collapses internal spaces when collapseSpaces is true",
      value: "  hello   world  ",
      collapseSpaces: true,
      expected: "hello world",
    },
    {
      name: "handles tabs and newlines",
      value: "\t\nhello\t\n",
      expected: "hello",
    },
    {
      name: "collapses tabs and newlines when collapseSpaces is true",
      value: "hello\t\n\nworld",
      collapseSpaces: true,
      expected: "hello world",
    },
    {
      name: "returns empty string for empty input",
      value: "",
      expected: "",
    },
  ])("$name", ({ value, collapseSpaces, expected }) => {
    const result = trimString({ value, collapseSpaces });
    expect(result).toBe(expected);
  });
});
