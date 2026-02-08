import type { AddResult } from "./markdown-reader.js";

export interface Validator {
  validate(): AddResult;
}

export function runValidators(params: { validators: Validator[] }): AddResult {
  for (const validator of params.validators) {
    const result = validator.validate();
    if (!result.success) {
      return result;
    }
  }
  return { success: true };
}

export class HasDescriptionValidator implements Validator {
  private readonly description: string;

  constructor(params: { description: string }) {
    this.description = params.description;
  }

  validate(): AddResult {
    if (this.description === "(No description)") {
      return {
        success: false,
        error:
          "Document must have a description. Add a paragraph after the title (# Title).",
      };
    }
    return { success: true };
  }
}

export class NotExistsValidator implements Validator {
  private readonly id: string;
  private readonly exists: boolean;

  constructor(params: { id: string; exists: boolean }) {
    this.id = params.id;
    this.exists = params.exists;
  }

  validate(): AddResult {
    if (this.exists) {
      return {
        success: false,
        error: `Document "${this.id}" already exists. Use 'update' to modify it.`,
      };
    }
    return { success: true };
  }
}

export class ExistsValidator implements Validator {
  private readonly id: string;
  private readonly exists: boolean;

  constructor(params: { id: string; exists: boolean }) {
    this.id = params.id;
    this.exists = params.exists;
  }

  validate(): AddResult {
    if (!this.exists) {
      return {
        success: false,
        error: `Document "${this.id}" not found.`,
      };
    }
    return { success: true };
  }
}

export class ValidIdValidator implements Validator {
  private readonly id: string;

  constructor(params: { id: string }) {
    this.id = params.id;
  }

  validate(): AddResult {
    // ID must be non-empty and contain only valid characters
    if (!this.id || this.id.trim() === "") {
      return {
        success: false,
        error: "Document ID cannot be empty.",
      };
    }

    // ID should only contain alphanumeric, hyphens, underscores, and double underscores for hierarchy
    const validIdPattern = /^[a-zA-Z0-9_-]+(__[a-zA-Z0-9_-]+)*$/;
    if (!validIdPattern.test(this.id)) {
      return {
        success: false,
        error: `Invalid document ID "${this.id}". Use only letters, numbers, hyphens, and underscores. Use '__' for hierarchy.`,
      };
    }

    return { success: true };
  }
}
