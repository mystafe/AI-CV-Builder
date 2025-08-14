import { rewriteBullet } from './api';
import { setByPath } from './path';
import { withinLimits } from './limits';
import { isEmail, isPhone } from './validators';

export type Issue = { path?: string; message: string };
export type FixResult = { ok: boolean; message?: string };

type InlineType = 'summary' | 'contact' | 'keyword';
export type UserAction = {
  needUser: true;
  type: InlineType;
  defaults?: { email?: string; phone?: string; keyword?: string; bucket?: 'primary' | 'secondary' | 'tools' };
  apply: (payload: any) => void;
};

function detectIssueType(message: string): { type: string; keyword?: string } {
  const long = /bullets?\[.*\].*too long|bullet exceeds limits/i;
  if (long.test(message)) return { type: 'LONG_BULLET' };
  if (/summary is missing/i.test(message)) return { type: 'MISSING_SUMMARY' };
  if (/invalid date format|date must be yyyy-mm/i.test(message)) return { type: 'DATE_FORMAT' };
  if (/invalid link|url not valid/i.test(message)) return { type: 'LINK_INVALID' };
  if (/email\/phone looks invalid|email looks invalid|phone looks invalid/i.test(message)) return { type: 'CONTACT_INVALID' };
  const kw = message.match(/missing keyword: (.+)/i);
  if (kw) return { type: 'MISSING_KEYWORD', keyword: kw[1].trim() };
  return { type: 'UNKNOWN' };
}

function ensureBulletPath(path: string) {
  const m = path.match(/^experience\[(\d+)\]\.bullets\[(\d+)\]\.text$/);
  if (!m) return null;
  return { exp: Number(m[1]), bullet: Number(m[2]) };
}

const fillerWords = ['the', 'a', 'an', 'very', 'really', 'just', 'actually'];
function removeFillers(text: string) {
  const re = new RegExp(`\\b(${fillerWords.join('|')})\\b`, 'gi');
  return text.replace(re, '').replace(/\s+/g, ' ').trim();
}
function trimClauses(text: string) {
  return text.split(/[,;]+/)[0];
}
function compressPhrases(text: string) {
  return text
    .replace(/responsible for /gi, '')
    .replace(/in order to /gi, 'to ')
    .replace(/worked with /gi, 'used ')
    .trim();
}
export function shortenBulletHeuristic(text: string) {
  let out = removeFillers(text);
  if (withinLimits(out)) return out;
  out = trimClauses(out);
  if (withinLimits(out)) return out;
  out = compressPhrases(out);
  if (withinLimits(out)) return out;
  return out
    .split(/\s+/)
    .slice(0, 28)
    .join(' ');
}

function normalizeDateString(s: string): string {
  const m = s.match(/(\d{4})[\/.\-](\d{1,2})/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, '0')}`;
  }
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

function addKeywordToSkills(cv: any, keyword: string, bucket: 'primary' | 'secondary' | 'tools') {
  const clone: any = structuredClone(cv);
  clone.skills = clone.skills || {};
  const arr = clone.skills[bucket] || [];
  if (!arr.includes(keyword)) arr.push(keyword);
  clone.skills[bucket] = arr;
  return clone;
}

function askUser(
  type: InlineType,
  defaults: any,
  apply: (payload: any) => void
): UserAction {
  return { needUser: true, type, defaults, apply };
}

export async function quickFix(
  issue: Issue,
  ctx: {
    cv: any;
    setCV: (cv: any) => void;
    locale: 'tr' | 'en';
    targetRole?: string;
    jobDescription?: string;
  }
): Promise<FixResult | UserAction> {
  const { type, keyword } = detectIssueType(issue.message);
  switch (type) {
    case 'LONG_BULLET': {
      if (!issue.path) return { ok: false, message: 'Missing path' };
      const info = ensureBulletPath(issue.path);
      if (!info) return { ok: false, message: 'Invalid path' };
      const bullet = ctx.cv?.experience?.[info.exp]?.bullets?.[info.bullet];
      if (!bullet) return { ok: false, message: 'Bullet not found' };
      let after = shortenBulletHeuristic(bullet.text);
      if (!withinLimits(after)) {
        try {
          const res = await rewriteBullet({
            before: bullet.text,
            locale: ctx.locale,
            targetRole: ctx.targetRole,
            jobDescription: ctx.jobDescription,
          });
          after = res.after;
        } catch (e: any) {
          return { ok: false, message: e.message };
        }
      }
      const cvCopy = structuredClone(ctx.cv);
      setByPath(cvCopy, issue.path, after);
      ctx.setCV(cvCopy);
      return { ok: true };
    }
    case 'MISSING_SUMMARY': {
      return askUser('summary', {}, ({ summary }) => {
        ctx.setCV({ ...ctx.cv, summary });
      });
    }
    case 'DATE_FORMAT': {
      ctx.setCV(normalizeDatesInCV(ctx.cv));
      return { ok: true };
    }
    case 'LINK_INVALID': {
      ctx.setCV(normalizeLinksInCV(ctx.cv));
      return { ok: true };
    }
    case 'CONTACT_INVALID': {
      const defaults = {
        email: ctx.cv?.email || ctx.cv?.basics?.email,
        phone: ctx.cv?.phone || ctx.cv?.basics?.phone,
      };
      return askUser('contact', defaults, ({ email, phone }) => {
        const cvCopy = structuredClone(ctx.cv);
        if (email && isEmail(email)) {
          cvCopy.email = email;
          if (cvCopy.basics) cvCopy.basics.email = email;
        }
        if (phone && isPhone(phone)) {
          cvCopy.phone = phone;
          if (cvCopy.basics) cvCopy.basics.phone = phone;
        }
        ctx.setCV(cvCopy);
      });
    }
    case 'MISSING_KEYWORD': {
      const kw = keyword || '';
      return askUser(
        'keyword',
        { keyword: kw, bucket: 'tools' },
        ({ keyword, bucket }) => {
          const cvCopy = addKeywordToSkills(ctx.cv, keyword, bucket);
          ctx.setCV(cvCopy);
        }
      );
    }
    default:
      return { ok: false, message: 'No automated fix' };
  }
}
