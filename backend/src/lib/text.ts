/**
 * Text utilities for simple normalization and keyword extraction.
 */

const STOPWORDS = new Set([
  'the','and','for','with','a','an','to','of','in','on','at','or','ve','ile','bir','için'
]);

/** Normalizes whitespace and removes basic stopwords */
export function normalizeJobDescription(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w.toLowerCase()))
    .join(' ')
    .trim();
}
