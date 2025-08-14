export function normalizeDateString(s: string): string {
  const m = s.match(/(\d{4})[\/.\-](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}`;
  return s;
}

export function normalizeDatesInCV(cv: any) {
  const clone: any = structuredClone(cv);
  function walk(obj: any) {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'string' && /date|start|end/i.test(k)) {
        obj[k] = normalizeDateString(v);
      } else if (v && typeof v === 'object') {
        walk(v);
      }
    }
  }
  walk(clone);
  return clone;
}

export function normalizeLinksInCV(cv: any) {
  const clone: any = structuredClone(cv);
  function walk(obj: any) {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (typeof v === 'string') {
        let s = v.trim();
        if (s.startsWith('www.')) s = `https://${s}`;
        s = s.replace(/\s+/g, '');
        obj[k] = s;
      } else if (v && typeof v === 'object') {
        walk(v);
      }
    }
  }
  walk(clone);
  return clone;
}
