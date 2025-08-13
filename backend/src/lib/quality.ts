// Quality checks and style enforcement for bullet rewriting

export function isSingleSentence(s: string): boolean {
  const matches = s.trim().match(/[.!?]/g);
  return !matches || matches.length <= 1;
}

export function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

export function changedMeaning(before: string, after: string): boolean {
  return before.trim().toLowerCase() !== after.trim().toLowerCase();
}

export function withinLimits(s: string): boolean {
  return s.length <= 220 && wordCount(s) <= 28;
}

export function containsFabrication(
  before: string,
  after: string,
  userFacts: string[]
): boolean {
  const source = (before + ' ' + userFacts.join(' ')).toLowerCase();
  const allowed = new Set(source.match(/[a-z0-9%]+/gi) ?? []);
  const tokens = after.match(/[a-z0-9%]+/gi) ?? [];
  for (const t of tokens) {
    const lower = t.toLowerCase();
    if (!allowed.has(lower)) {
      if (/\d/.test(t) || /^[A-Z]/.test(t)) {
        return true;
      }
    }
  }
  return false;
}

export function enforceStyle(after: string, locale: 'en' | 'tr'): string {
  let s = after.trim();
  if (locale === 'en') {
    s = s.replace(/^(I|We)\s+/i, '');
    const map: Record<string, string> = {
      Worked: 'Built',
      Was: 'Led',
      Did: 'Completed',
      Made: 'Created',
      Responsible: 'Led',
    };
    for (const [weak, strong] of Object.entries(map)) {
      const r = new RegExp(`^${weak}\\b`, 'i');
      if (r.test(s)) {
        s = s.replace(r, strong);
        break;
      }
    }
  } else {
    s = s.replace(/^(Ben|Biz)\s+/i, '');
    const map: Record<string, string> = {
      Çalıştım: 'Geliştirdim',
      Yaptım: 'Gerçekleştirdim',
      Sorumluydum: 'Yönettim',
    };
    for (const [weak, strong] of Object.entries(map)) {
      const r = new RegExp(`^${weak}\\b`, 'i');
      if (r.test(s)) {
        s = s.replace(r, strong);
        break;
      }
    }
  }
  if (s.length === 0) return after;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
