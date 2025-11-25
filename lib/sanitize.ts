/**
 * Input sanitization utilities to prevent XSS attacks
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitizes a string by removing potentially dangerous characters
 * and escaping HTML
 */
export function sanitizeString(input: string | undefined | null): string {
  if (!input) {
    return "";
  }

  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  // Escape HTML
  return escapeHtml(sanitized);
}

/**
 * Sanitizes an object by sanitizing all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value) as T[typeof key];
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>) as T[typeof key];
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === "string" ? sanitizeString(item) : item
      ) as T[typeof key];
    }
  }

  return sanitized;
}

/**
 * Sanitizes text for use in HTML attributes
 */
export function sanitizeAttribute(input: string): string {
  return escapeHtml(input).replace(/"/g, "&quot;");
}

