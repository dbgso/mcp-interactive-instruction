import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { MarkdownSummary } from "../types/index.js";
import {
  runValidators,
  HasDescriptionValidator,
  NotExistsValidator,
  ExistsValidator,
} from "./validators.js";

export interface AddResult {
  success: boolean;
  error?: string;
  path?: string;
}

export interface CategoryInfo {
  id: string;
  docCount: number;
}

interface CacheEntry {
  documents: MarkdownSummary[];
  categories: CategoryInfo[];
  timestamp: number;
}

const ID_SEPARATOR = "__";
const CACHE_TTL = 60_000; // 1 minute

export class MarkdownReader {
  private readonly directory: string;
  private cache: CacheEntry | null = null;

  constructor(directory: string) {
    this.directory = path.resolve(directory);
  }

  /**
   * Convert hierarchical ID to file path
   * "git__workflow" -> "git/workflow.md"
   */
  private idToPath(id: string): string {
    const parts = id.split(ID_SEPARATOR);
    return path.join(this.directory, ...parts) + ".md";
  }

  /**
   * Convert file path to hierarchical ID
   * "git/workflow.md" -> "git__workflow"
   */
  private pathToId(filePath: string): string {
    const relativePath = path.relative(this.directory, filePath);
    const withoutExt = relativePath.slice(0, -3); // remove .md
    return withoutExt.split(path.sep).join(ID_SEPARATOR);
  }

  /**
   * Recursively scan directory for markdown files
   */
  private async scanDirectory(dir: string): Promise<MarkdownSummary[]> {
    const summaries: MarkdownSummary[] = [];

    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          const subDocs = await this.scanDirectory(fullPath);
          summaries.push(...subDocs);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const id = this.pathToId(fullPath);
          const description = await this.extractDescription(fullPath);
          summaries.push({ id, description });
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    return summaries;
  }

  /**
   * Build category info from documents
   */
  private buildCategories(documents: MarkdownSummary[]): CategoryInfo[] {
    const categoryMap = new Map<string, number>();

    for (const doc of documents) {
      const parts = doc.id.split(ID_SEPARATOR);
      if (parts.length > 1) {
        const category = parts[0];
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      }
    }

    return Array.from(categoryMap.entries())
      .map(([id, docCount]) => ({ id, docCount }))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  /**
   * Get or refresh cache
   */
  private async getCache(): Promise<CacheEntry> {
    const now = Date.now();

    if (this.cache && now - this.cache.timestamp < CACHE_TTL) {
      return this.cache;
    }

    const documents = await this.scanDirectory(this.directory);
    documents.sort((a, b) => a.id.localeCompare(b.id));
    const categories = this.buildCategories(documents);

    this.cache = { documents, categories, timestamp: now };
    return this.cache;
  }

  /**
   * Invalidate cache (called after add/update)
   */
  invalidateCache(): void {
    this.cache = null;
  }

  /**
   * List documents with optional filtering
   * @param parentId - Filter by parent category (e.g., "git" shows git__* docs)
   * @param recursive - If true, show all nested docs; if false, show immediate children only
   */
  async listDocuments(params?: {
    parentId?: string;
    recursive?: boolean;
  }): Promise<{ documents: MarkdownSummary[]; categories: CategoryInfo[] }> {
    const { parentId, recursive = false } = params ?? {};
    const cache = await this.getCache();

    if (!parentId) {
      if (recursive) {
        return { documents: cache.documents, categories: [] };
      }
      // Show root-level docs and categories
      const rootDocs = cache.documents.filter(
        (d) => !d.id.includes(ID_SEPARATOR)
      );
      return { documents: rootDocs, categories: cache.categories };
    }

    // Filter by parent
    const prefix = parentId + ID_SEPARATOR;
    const filtered = cache.documents.filter((d) => d.id.startsWith(prefix));

    if (recursive) {
      return { documents: filtered, categories: [] };
    }

    // Show immediate children only
    const immediateChildren: MarkdownSummary[] = [];
    const subCategories = new Map<string, number>();

    for (const doc of filtered) {
      const remainder = doc.id.slice(prefix.length);
      const parts = remainder.split(ID_SEPARATOR);

      if (parts.length === 1) {
        immediateChildren.push(doc);
      } else {
        const subCat = parentId + ID_SEPARATOR + parts[0];
        subCategories.set(subCat, (subCategories.get(subCat) || 0) + 1);
      }
    }

    const categories = Array.from(subCategories.entries())
      .map(([id, docCount]) => ({ id, docCount }))
      .sort((a, b) => a.id.localeCompare(b.id));

    return { documents: immediateChildren, categories };
  }

  /**
   * Check if ID is a category (directory) rather than a document
   */
  async isCategory(id: string): Promise<boolean> {
    const cache = await this.getCache();
    const prefix = id + ID_SEPARATOR;
    return cache.documents.some((d) => d.id.startsWith(prefix));
  }

  formatDocumentList(params: {
    documents: MarkdownSummary[];
    categories: CategoryInfo[];
  }): string {
    const { documents, categories } = params;
    if (documents.length === 0 && categories.length === 0) {
      return "No markdown documents found.";
    }

    const lines = ["Available documents:", ""];

    if (categories.length > 0) {
      lines.push("**Categories:**");
      for (const cat of categories) {
        lines.push(`- **${cat.id}/** (${cat.docCount} docs)`);
      }
      lines.push("");
    }

    if (documents.length > 0) {
      if (categories.length > 0) {
        lines.push("**Documents:**");
      }
      for (const doc of documents) {
        lines.push(`- **${doc.id}**: ${doc.description}`);
      }
    }

    return lines.join("\n");
  }

  async getDocumentContent(id: string): Promise<string | null> {
    const filePath = this.idToPath(id);

    try {
      const content = await fs.readFile(filePath, "utf-8");
      return content;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  async documentExists(id: string): Promise<boolean> {
    const filePath = this.idToPath(id);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async addDocument(params: {
    id: string;
    content: string;
  }): Promise<AddResult> {
    const { id, content } = params;

    const description = this.parseDescription(content);
    const exists = await this.documentExists(id);

    const validation = runValidators({
      validators: [
        new HasDescriptionValidator({ description }),
        new NotExistsValidator({ id, exists }),
      ],
    });
    if (!validation.success) {
      return validation;
    }

    try {
      const filePath = this.idToPath(id);
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, content, "utf-8");
      this.invalidateCache();
      return { success: true, path: filePath };
    } catch (error) {
      return {
        success: false,
        error: `Failed to add document: ${(error as Error).message}`,
      };
    }
  }

  async updateDocument(params: {
    id: string;
    content: string;
  }): Promise<AddResult> {
    const { id, content } = params;

    const description = this.parseDescription(content);
    const exists = await this.documentExists(id);

    const validation = runValidators({
      validators: [
        new HasDescriptionValidator({ description }),
        new ExistsValidator({ id, exists }),
      ],
    });
    if (!validation.success) {
      return validation;
    }

    try {
      const filePath = this.idToPath(id);
      await fs.writeFile(filePath, content, "utf-8");
      this.invalidateCache();
      return { success: true, path: filePath };
    } catch (error) {
      return {
        success: false,
        error: `Failed to update document: ${(error as Error).message}`,
      };
    }
  }

  async deleteDocument(id: string): Promise<AddResult> {
    const exists = await this.documentExists(id);
    if (!exists) {
      return {
        success: false,
        error: `Document "${id}" not found.`,
      };
    }

    try {
      const filePath = this.idToPath(id);
      await fs.unlink(filePath);

      // Try to remove empty parent directories
      const dir = path.dirname(filePath);
      await this.removeEmptyDirs(dir);

      this.invalidateCache();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to delete document: ${(error as Error).message}`,
      };
    }
  }

  async renameDocument(params: {
    oldId: string;
    newId: string;
    overwrite?: boolean;
  }): Promise<AddResult> {
    const { oldId, newId, overwrite = false } = params;
    const oldExists = await this.documentExists(oldId);
    if (!oldExists) {
      return {
        success: false,
        error: `Document "${oldId}" not found.`,
      };
    }

    const newExists = await this.documentExists(newId);
    if (newExists && !overwrite) {
      return {
        success: false,
        error: `Document "${newId}" already exists.`,
      };
    }

    try {
      const oldPath = this.idToPath(oldId);
      const newPath = this.idToPath(newId);

      // Delete existing file if overwriting
      if (newExists && overwrite) {
        await fs.unlink(newPath);
      }

      // Create new directory if needed
      const newDir = path.dirname(newPath);
      await fs.mkdir(newDir, { recursive: true });

      // Move the file
      await fs.rename(oldPath, newPath);

      // Try to remove empty parent directories from old location
      const oldDir = path.dirname(oldPath);
      await this.removeEmptyDirs(oldDir);

      this.invalidateCache();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Failed to rename document: ${(error as Error).message}`,
      };
    }
  }

  private async removeEmptyDirs(dir: string): Promise<void> {
    // Don't remove the root directory
    if (dir === this.directory || !dir.startsWith(this.directory)) {
      return;
    }

    try {
      const entries = await fs.readdir(dir);
      if (entries.length === 0) {
        await fs.rmdir(dir);
        // Recursively try parent
        await this.removeEmptyDirs(path.dirname(dir));
      }
    } catch {
      // Ignore errors (directory not empty or doesn't exist)
    }
  }

  private async extractDescription(filePath: string): Promise<string> {
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return this.parseDescription(content);
    } catch {
      return "(Unable to read file)";
    }
  }

  private parseDescription(content: string): string {
    const lines = content.split("\n");
    let foundTitle = false;
    const descriptionLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (!foundTitle && trimmed.startsWith("# ")) {
        foundTitle = true;
        continue;
      }

      if (foundTitle) {
        if (trimmed === "") {
          if (descriptionLines.length > 0) {
            break;
          }
          continue;
        }

        if (trimmed.startsWith("#")) {
          break;
        }

        descriptionLines.push(trimmed);
      }
    }

    if (descriptionLines.length === 0) {
      return "(No description)";
    }

    const description = descriptionLines.join(" ");
    const maxLength = 150;
    if (description.length > maxLength) {
      return description.slice(0, maxLength - 3) + "...";
    }
    return description;
  }
}
