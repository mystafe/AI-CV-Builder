import DiffMatchPatch from 'diff-match-patch';

export type DiffPart = { type: 'equal' | 'insert' | 'delete'; text: string };

const dmp = new DiffMatchPatch();

function tokenize(str: string): string[] {
  return str.match(/\S+|\s+/g) ?? [];
}

export function diffWords(before: string, after: string): DiffPart[] {
  const a = tokenize(before);
  const b = tokenize(after);
  const sep = '\u0001';
  const text1 = a.join(sep);
  const text2 = b.join(sep);

  const diffs = dmp.diff_main(text1, text2);
  dmp.diff_cleanupSemantic(diffs);

  const parts: DiffPart[] = [];
  for (const [op, data] of diffs) {
    const text = data.split(sep).join('');
    let type: DiffPart['type'];
    switch (op) {
      case DiffMatchPatch.DIFF_INSERT:
        type = 'insert';
        break;
      case DiffMatchPatch.DIFF_DELETE:
        type = 'delete';
        break;
      default:
        type = 'equal';
    }
    if (text) parts.push({ type, text });
  }
  return parts;
}
