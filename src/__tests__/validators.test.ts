import { describe, it, expect } from "vitest";
import {
  runValidators,
  HasDescriptionValidator,
  NotExistsValidator,
  ExistsValidator,
  ValidIdValidator,
  type Validator,
} from "../services/validators.js";

describe("validators", () => {
  describe("HasDescriptionValidator", () => {
    it.each<{ name: string; description: string; expectedSuccess: boolean }>([
      { name: "success with description", description: "Has content.", expectedSuccess: true },
      { name: "error without description", description: "(No description)", expectedSuccess: false },
    ])("$name", ({ description, expectedSuccess }) => {
      const validator = new HasDescriptionValidator({ description });
      const result = validator.validate();

      expect(result.success).toBe(expectedSuccess);
      if (!expectedSuccess) {
        expect(result.error).toContain("must have a description");
      }
    });
  });

  describe("NotExistsValidator", () => {
    it.each<{ name: string; exists: boolean; expectedSuccess: boolean }>([
      { name: "success when not exists", exists: false, expectedSuccess: true },
      { name: "error when exists", exists: true, expectedSuccess: false },
    ])("$name", ({ exists, expectedSuccess }) => {
      const validator = new NotExistsValidator({ id: "test-doc", exists });
      const result = validator.validate();

      expect(result.success).toBe(expectedSuccess);
      if (!expectedSuccess) {
        expect(result.error).toContain("already exists");
      }
    });
  });

  describe("ExistsValidator", () => {
    it.each<{ name: string; exists: boolean; expectedSuccess: boolean }>([
      { name: "success when exists", exists: true, expectedSuccess: true },
      { name: "error when not exists", exists: false, expectedSuccess: false },
    ])("$name", ({ exists, expectedSuccess }) => {
      const validator = new ExistsValidator({ id: "test-doc", exists });
      const result = validator.validate();

      expect(result.success).toBe(expectedSuccess);
      if (!expectedSuccess) {
        expect(result.error).toContain("not found");
      }
    });
  });

  describe("ValidIdValidator", () => {
    it.each<{ name: string; id: string; expectedSuccess: boolean; errorContains?: string }>([
      { name: "success with valid simple id", id: "my-doc", expectedSuccess: true },
      { name: "success with valid id using underscores", id: "my_doc", expectedSuccess: true },
      { name: "success with valid hierarchical id", id: "coding__testing", expectedSuccess: true },
      { name: "success with deep hierarchy", id: "category__sub__item", expectedSuccess: true },
      { name: "error with empty string", id: "", expectedSuccess: false, errorContains: "cannot be empty" },
      { name: "error with whitespace only", id: "   ", expectedSuccess: false, errorContains: "cannot be empty" },
      { name: "error with spaces in id", id: "my doc", expectedSuccess: false, errorContains: "Invalid document ID" },
      { name: "error with special characters", id: "my@doc!", expectedSuccess: false, errorContains: "Invalid document ID" },
      { name: "error with single underscore separator", id: "coding_testing", expectedSuccess: true },
    ])("$name", ({ id, expectedSuccess, errorContains }) => {
      const validator = new ValidIdValidator({ id });
      const result = validator.validate();

      expect(result.success).toBe(expectedSuccess);
      if (!expectedSuccess && errorContains) {
        expect(result.error).toContain(errorContains);
      }
    });
  });

  describe("runValidators", () => {
    it("returns success when all validators pass", () => {
      const alwaysPass: Validator = { validate: () => ({ success: true }) };

      const result = runValidators({
        validators: [alwaysPass, alwaysPass],
      });

      expect(result.success).toBe(true);
    });

    it("returns first error and stops", () => {
      const fail1: Validator = { validate: () => ({ success: false, error: "First error" }) };
      const fail2: Validator = { validate: () => ({ success: false, error: "Second error" }) };

      const result = runValidators({
        validators: [fail1, fail2],
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("First error");
    });

    it("returns success with empty validators", () => {
      const result = runValidators({ validators: [] });

      expect(result.success).toBe(true);
    });
  });
});
