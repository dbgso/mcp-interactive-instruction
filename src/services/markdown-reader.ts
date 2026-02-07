import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { MarkdownSummary } from "../types/index.js";

export interface AddResult {
  success: boolean;
  error?: string;
}

export class MarkdownReader {
  private readonly directory: string;

  constructor(directory: string) {
    this.directory = path.resolve(directory);
  }

  async listDocuments(): Promise<MarkdownSummary[]> {
    const entries = await fs.readdir(this.directory, { withFileTypes: true });
    const summaries: MarkdownSummary[] = [];

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".md")) {
        const id = entry.name.slice(0, -3);
        const filePath = path.join(this.directory, entry.name);
        const description = await this.extractDescription(filePath);
        summaries.push({ id, description });
      }
    }

    summaries.sort((a, b) => a.id.localeCompare(b.id));
    return summaries;
  }

  formatDocumentList(summaries: MarkdownSummary[]): string {
    if (summaries.length === 0) {
      return "No markdown documents found.";
    }

    const lines = ["Available documents:", ""];
    for (const summary of summaries) {
      lines.push(`- **${summary.id}**: ${summary.description}`);
    }
    return lines.join("\n");
  }

  async getDocumentContent(id: string): Promise<string | null> {
    const filePath = path.join(this.directory, `${id}.md`);

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
    const filePath = path.join(this.directory, `${id}.md`);
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async addDocument(id: string, content: string): Promise<AddResult> {
    const exists = await this.documentExists(id);
    if (exists) {
      return {
        success: false,
        error: `Document "${id}" already exists. Use 'update' to modify it.`,
      };
    }

    const filePath = path.join(this.directory, `${id}.md`);
    await fs.writeFile(filePath, content, "utf-8");
    return { success: true };
  }

  async updateDocument(id: string, content: string): Promise<boolean> {
    const exists = await this.documentExists(id);
    if (!exists) {
      return false;
    }
    const filePath = path.join(this.directory, `${id}.md`);
    await fs.writeFile(filePath, content, "utf-8");
    return true;
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
