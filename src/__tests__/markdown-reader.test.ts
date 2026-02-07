import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MarkdownReader } from "../services/markdown-reader.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, "fixtures");
const tempDir = path.join(__dirname, "temp");

describe("MarkdownReader", () => {
  describe("listDocuments", () => {
    it.each([
      ["sample", "This is a sample document for testing purposes."],
      ["no-description", "(No description)"],
    ])("should return correct description for %s", async (id, expected) => {
      const reader = new MarkdownReader(fixturesDir);
      const docs = await reader.listDocuments();
      const doc = docs.find((d) => d.id === id);

      expect(doc).toBeDefined();
      expect(doc?.description).toBe(expected);
    });

    it("should sort documents by id", async () => {
      const reader = new MarkdownReader(fixturesDir);
      const docs = await reader.listDocuments();

      const ids = docs.map((d) => d.id);
      const sorted = [...ids].sort();
      expect(ids).toEqual(sorted);
    });
  });

  describe("formatDocumentList", () => {
    const reader = new MarkdownReader(fixturesDir);

    it.each([
      {
        summaries: [],
        expected: "No markdown documents found.",
      },
      {
        summaries: [{ id: "test", description: "Test doc" }],
        expected: "Available documents:\n\n- **test**: Test doc",
      },
      {
        summaries: [
          { id: "a", description: "Doc A" },
          { id: "b", description: "Doc B" },
        ],
        expected: "Available documents:\n\n- **a**: Doc A\n- **b**: Doc B",
      },
    ])("formats $summaries.length documents correctly", ({ summaries, expected }) => {
      expect(reader.formatDocumentList(summaries)).toBe(expected);
    });
  });

  describe("getDocumentContent", () => {
    it.each([
      ["sample", ["# Sample Document", "## Section 1"]],
      ["no-description", ["# No Description"]],
    ])("should return content for %s", async (id, expectedContents) => {
      const reader = new MarkdownReader(fixturesDir);
      const content = await reader.getDocumentContent(id);

      expect(content).not.toBeNull();
      for (const expected of expectedContents) {
        expect(content).toContain(expected);
      }
    });

    it("should return null for non-existent document", async () => {
      const reader = new MarkdownReader(fixturesDir);
      const content = await reader.getDocumentContent("non-existent");

      expect(content).toBeNull();
    });
  });

  describe("document operations", () => {
    beforeEach(async () => {
      await fs.mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    it.each([
      ["new-doc", "# New Doc\n\nNew content."],
      ["another", "# Another\n\nAnother doc."],
    ])("should add document %s", async (id, content) => {
      const reader = new MarkdownReader(tempDir);

      const result = await reader.addDocument(id, content);

      expect(result.success).toBe(true);
      const saved = await reader.getDocumentContent(id);
      expect(saved).toBe(content);
    });

    it("should return error when adding existing document", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument("existing", "# First");
      const result = await reader.addDocument("existing", "# Second");

      expect(result.success).toBe(false);
      expect(result.error).toContain("already exists");
    });

    it.each([
      ["missing", false],
      ["exists", true],
    ])("documentExists returns %s for %s doc", async (id, expected) => {
      const reader = new MarkdownReader(tempDir);

      if (expected) {
        await reader.addDocument(id, "# Exists\n\nContent.");
      }

      expect(await reader.documentExists(id)).toBe(expected);
    });

    it("should update existing document", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument("to-update", "# Original\n\nOriginal content.");
      const updated = await reader.updateDocument(
        "to-update",
        "# Updated\n\nUpdated content."
      );

      expect(updated).toBe(true);
      const content = await reader.getDocumentContent("to-update");
      expect(content).toContain("Updated content.");
    });

    it("should return false when updating non-existent document", async () => {
      const reader = new MarkdownReader(tempDir);
      const updated = await reader.updateDocument("missing", "# Content");

      expect(updated).toBe(false);
    });
  });

  describe("parseDescription", () => {
    beforeEach(async () => {
      await fs.mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    it.each([
      {
        name: "truncates long descriptions",
        content: `# Long\n\n${"A".repeat(200)}\n\n## Next`,
        check: (desc: string) =>
          desc.length === 150 && desc.endsWith("..."),
      },
      {
        name: "handles multi-line paragraphs",
        content: "# Multi\n\nFirst line.\nSecond line.\n\n## Next",
        check: (desc: string) => desc === "First line. Second line.",
      },
      {
        name: "handles empty content after title",
        content: "# Empty",
        check: (desc: string) => desc === "(No description)",
      },
    ])("$name", async ({ content, check }) => {
      const reader = new MarkdownReader(tempDir);
      await reader.addDocument("test", content);

      const docs = await reader.listDocuments();
      const doc = docs.find((d) => d.id === "test");

      expect(check(doc!.description)).toBe(true);
    });
  });
});
