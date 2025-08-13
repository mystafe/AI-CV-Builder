export const WORD_LIMIT = 28;
export const CHAR_LIMIT = 220;

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function withinLimits(s: string): boolean {
  return wordCount(s) <= WORD_LIMIT && s.length <= CHAR_LIMIT;
}

export function isSingleSentence(s: string): boolean {
  const matches = s.match(/[.!?]/g);
  return !matches || matches.length <= 1;
}
