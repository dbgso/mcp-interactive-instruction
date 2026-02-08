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
