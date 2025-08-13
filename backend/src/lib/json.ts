/**
 * JSON utilities for safe parsing and cleanup.
 */

/** Safely parses JSON without throwing */
export function safeJsonParse<T>(
  s: string
): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(s) as T };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Forces a string into a JSON object shape */
export function forceJsonObject(s: string): string {
  let text = s.trim();
  text = text.replace(/^```(?:json)?\s*/i, "");
  text = text.replace(/```$/i, "");
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1) {
    text = text.slice(first, last + 1);
  }
  return text;
}
