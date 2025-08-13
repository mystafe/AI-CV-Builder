export function stableQuestionId({ path, text }: { path?: string; text: string }): string {
  const input = `${path ?? ''}|${text}`;
  let hash = 0x811c9dc5; // FNV-1a 32-bit offset
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}
