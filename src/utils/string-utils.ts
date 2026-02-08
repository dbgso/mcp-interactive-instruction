/**
 * Trims whitespace from a string and optionally collapses multiple spaces.
 */
export function trimString(params: {
  value: string;
  collapseSpaces?: boolean;
}): string {
  const { value, collapseSpaces = false } = params;

  let result = value.trim();

  if (collapseSpaces) {
    result = result.replace(/\s+/g, " ");
  }

  return result;
}
