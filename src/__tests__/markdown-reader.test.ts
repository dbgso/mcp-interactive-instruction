import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MarkdownReader } from "../services/markdown-reader.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const fixturesDir = path.join(process.cwd(), "src/__tests__/fixtures");
const tempDir = path.join(process.cwd(), "src/__tests__/temp");

describe("MarkdownReader", () => {
  describe("listDocuments (flat)", () => {
    it.each([
      ["sample", "This is a sample document for testing purposes."],
      ["no-description", "(No description)"],
    ])("should return correct description for %s", async (id, expected) => {
      const reader = new MarkdownReader(fixturesDir);
      const { documents } = await reader.listDocuments({ recursive: true });
      const doc = documents.find((d) => d.id === id);

      expect(doc).toBeDefined();
      expect(doc?.description).toBe(expected);
    });

    it("should sort documents by id", async () => {
      const reader = new MarkdownReader(fixturesDir);
      const { documents } = await reader.listDocuments({ recursive: true });

      const ids = documents.map((d) => d.id);
      const sorted = [...ids].sort();
      expect(ids).toEqual(sorted);
    });
  });

  describe("formatDocumentList", () => {
    const reader = new MarkdownReader(fixturesDir);

    it.each([
      {
        documents: [],
        categories: [],
        expected: "No markdown documents found.",
      },
      {
        documents: [{ id: "test", description: "Test doc" }],
        categories: [],
        expected: "Available documents:\n\n- **test**: Test doc",
      },
      {
        documents: [
          { id: "a", description: "Doc A" },
          { id: "b", description: "Doc B" },
        ],
        categories: [],
        expected: "Available documents:\n\n- **a**: Doc A\n- **b**: Doc B",
      },
      {
        documents: [{ id: "root", description: "Root doc" }],
        categories: [{ id: "git", docCount: 3 }],
        expected:
          "Available documents:\n\n**Categories:**\n- **git/** (3 docs)\n\n**Documents:**\n- **root**: Root doc",
      },
    ])(
      "formats documents and categories correctly",
      ({ documents, categories, expected }) => {
        expect(reader.formatDocumentList({ documents, categories })).toBe(expected);
      }
    );
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

      const result = await reader.addDocument({ id, content });

      expect(result.success, `addDocument failed: ${result.error}`).toBe(true);
      const saved = await reader.getDocumentContent(id);
      expect(saved).toBe(content);
    });

    it("should return error when adding existing document", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "existing", content: "# First" });
      const result = await reader.addDocument({ id: "existing", content: "# Second" });

      expect(result.success).toBe(false);
      expect(result.error).toContain("already exists");
    });

    it.each([
      ["missing", false],
      ["exists", true],
    ])("documentExists returns %s for %s doc", async (id, expected) => {
      const reader = new MarkdownReader(tempDir);

      if (expected) {
        await reader.addDocument({ id, content: "# Exists\n\nContent." });
      }

      expect(await reader.documentExists(id)).toBe(expected);
    });

    it("should update existing document", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "to-update", content: "# Original\n\nOriginal content." });
      const updated = await reader.updateDocument({
        id: "to-update",
        content: "# Updated\n\nUpdated content.",
      });

      expect(updated).toBe(true);
      const content = await reader.getDocumentContent("to-update");
      expect(content).toContain("Updated content.");
    });

    it("should return false when updating non-existent document", async () => {
      const reader = new MarkdownReader(tempDir);
      const updated = await reader.updateDocument({ id: "missing", content: "# Content" });

      expect(updated).toBe(false);
    });
  });

  describe("hierarchical structure", () => {
    beforeEach(async () => {
      await fs.mkdir(tempDir, { recursive: true });
    });

    afterEach(async () => {
      await fs.rm(tempDir, { recursive: true, force: true });
    });

    it("should create nested directories with __ separator", async () => {
      const reader = new MarkdownReader(tempDir);

      const result = await reader.addDocument({
        id: "git__workflow",
        content: "# Git Workflow\n\nHow to use git.",
      });

      expect(result.success).toBe(true);

      // Verify file was created in subdirectory
      const filePath = path.join(tempDir, "git", "workflow.md");
      const exists = await fs
        .access(filePath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    });

    it("should read nested documents by hierarchical ID", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({
        id: "api__auth__oauth",
        content: "# OAuth\n\nOAuth authentication.",
      });
      const content = await reader.getDocumentContent("api__auth__oauth");

      expect(content).toContain("# OAuth");
    });

    it("should list categories at root level", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "root-doc", content: "# Root\n\nRoot level doc." });
      await reader.addDocument({
        id: "git__workflow",
        content: "# Git Workflow\n\nWorkflow doc.",
      });
      await reader.addDocument({ id: "git__commands", content: "# Git Commands\n\nCommands." });

      const { documents, categories } = await reader.listDocuments();

      expect(documents).toHaveLength(1);
      expect(documents[0].id).toBe("root-doc");
      expect(categories).toHaveLength(1);
      expect(categories[0]).toEqual({ id: "git", docCount: 2 });
    });

    it("should list documents in category", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({
        id: "git__workflow",
        content: "# Git Workflow\n\nWorkflow doc.",
      });
      await reader.addDocument({ id: "git__commands", content: "# Git Commands\n\nCommands." });
      await reader.addDocument({ id: "git__branching", content: "# Branching\n\nBranching." });

      const { documents, categories } = await reader.listDocuments({ parentId: "git" });

      expect(documents).toHaveLength(3);
      expect(categories).toHaveLength(0);
      expect(documents.map((d) => d.id).sort()).toEqual([
        "git__branching",
        "git__commands",
        "git__workflow",
      ]);
    });

    it("should list all documents recursively", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "root", content: "# Root\n\nRoot doc." });
      await reader.addDocument({ id: "git__workflow", content: "# Workflow\n\nWorkflow." });
      await reader.addDocument({ id: "api__auth", content: "# Auth\n\nAuth." });

      const { documents } = await reader.listDocuments({ recursive: true });

      expect(documents).toHaveLength(3);
    });

    it("should identify categories correctly", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "git__workflow", content: "# Workflow\n\nWorkflow." });
      await reader.addDocument({ id: "standalone", content: "# Standalone\n\nDoc." });

      expect(await reader.isCategory("git")).toBe(true);
      expect(await reader.isCategory("standalone")).toBe(false);
      expect(await reader.isCategory("nonexistent")).toBe(false);
    });

    it("should invalidate cache after add", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "first", content: "# First\n\nFirst doc." });
      const { documents: before } = await reader.listDocuments({ recursive: true });

      await reader.addDocument({ id: "second", content: "# Second\n\nSecond doc." });
      const { documents: after } = await reader.listDocuments({ recursive: true });

      expect(before).toHaveLength(1);
      expect(after).toHaveLength(2);
    });

    it("should invalidate cache after update", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "doc", content: "# Original\n\nOriginal description." });
      const { documents: before } = await reader.listDocuments({ recursive: true });

      await reader.updateDocument({ id: "doc", content: "# Updated\n\nNew description here." });
      const { documents: after } = await reader.listDocuments({ recursive: true });

      expect(before[0].description).toBe("Original description.");
      expect(after[0].description).toBe("New description here.");
    });

    it("should delete document", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "to-delete", content: "# Delete Me\n\nContent." });
      expect(await reader.documentExists("to-delete")).toBe(true);

      const result = await reader.deleteDocument("to-delete");
      expect(result.success).toBe(true);
      expect(await reader.documentExists("to-delete")).toBe(false);
    });

    it("should return error when deleting non-existent document", async () => {
      const reader = new MarkdownReader(tempDir);

      const result = await reader.deleteDocument("non-existent");
      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should delete nested document and clean up empty dirs", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "cat__sub__doc", content: "# Nested\n\nContent." });
      const result = await reader.deleteDocument("cat__sub__doc");

      expect(result.success).toBe(true);

      // Check that empty directories were removed
      const catExists = await import("node:fs/promises")
        .then((fs) => fs.access(path.join(tempDir, "cat")))
        .then(() => true)
        .catch(() => false);
      expect(catExists).toBe(false);
    });

    it("should rename document", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "old-name", content: "# Doc\n\nContent." });
      const result = await reader.renameDocument({ oldId: "old-name", newId: "new-name" });

      expect(result.success).toBe(true);
      expect(await reader.documentExists("old-name")).toBe(false);
      expect(await reader.documentExists("new-name")).toBe(true);

      const content = await reader.getDocumentContent("new-name");
      expect(content).toContain("# Doc");
    });

    it("should rename document to different category", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "root-doc", content: "# Doc\n\nContent." });
      const result = await reader.renameDocument({ oldId: "root-doc", newId: "category__doc" });

      expect(result.success).toBe(true);
      expect(await reader.documentExists("root-doc")).toBe(false);
      expect(await reader.documentExists("category__doc")).toBe(true);
    });

    it("should return error when renaming non-existent document", async () => {
      const reader = new MarkdownReader(tempDir);

      const result = await reader.renameDocument({ oldId: "non-existent", newId: "new-name" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("not found");
    });

    it("should return error when renaming to existing document", async () => {
      const reader = new MarkdownReader(tempDir);

      await reader.addDocument({ id: "doc1", content: "# Doc 1\n\nContent." });
      await reader.addDocument({ id: "doc2", content: "# Doc 2\n\nContent." });

      const result = await reader.renameDocument({ oldId: "doc1", newId: "doc2" });
      expect(result.success).toBe(false);
      expect(result.error).toContain("already exists");
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
        check: (desc: string) => desc.length === 150 && desc.endsWith("..."),
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
      await reader.addDocument({ id: "test", content });

      const { documents } = await reader.listDocuments({ recursive: true });
      const doc = documents.find((d) => d.id === "test");

      expect(check(doc!.description)).toBe(true);
    });
  });
});
