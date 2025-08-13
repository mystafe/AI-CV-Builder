import { CV } from "../schema/cv";

export interface Issue {
  path?: string;
  message: string;
}

interface AtsContext {
  targetRole: string;
  jobDescription?: string;
}

interface AtsResult {
  score: number;
  issues: Issue[];
}

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const URL_RE = /^https?:\/\//i;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^\+?[0-9\s-]{7,15}$/;

function checkDates(cv: CV): Issue[] {
  const issues: Issue[] = [];
  cv.experience.forEach((exp, i) => {
    if (!exp.startDate || !DATE_RE.test(exp.startDate)) {
      issues.push({ path: `experience[${i}].startDate`, message: "Invalid date format" });
    }
    if (exp.endDate && !DATE_RE.test(exp.endDate)) {
      issues.push({ path: `experience[${i}].endDate`, message: "Invalid date format" });
    }
    if (exp.startDate && exp.endDate && exp.endDate < exp.startDate) {
      issues.push({ path: `experience[${i}].endDate`, message: "End date before start date" });
    }
  });
  cv.education.forEach((ed, i) => {
    if (!ed.startDate || !DATE_RE.test(ed.startDate)) {
      issues.push({ path: `education[${i}].startDate`, message: "Invalid date format" });
    }
    if (ed.endDate && !DATE_RE.test(ed.endDate)) {
      issues.push({ path: `education[${i}].endDate`, message: "Invalid date format" });
    }
    if (ed.startDate && ed.endDate && ed.endDate < ed.startDate) {
      issues.push({ path: `education[${i}].endDate`, message: "End date before start date" });
    }
  });
  return issues;
}

function checkBullets(cv: CV): Issue[] {
  const issues: Issue[] = [];
  cv.experience.forEach((exp, i) => {
    exp.bullets.forEach((b, j) => {
      const words = b.text.trim().split(/\s+/).length;
      if (words > 28 || b.text.length > 220) {
        issues.push({ path: `experience[${i}].bullets[${j}]`, message: "Bullet too long" });
      }
      if (!b.text.trim().endsWith('.')) {
        issues.push({ path: `experience[${i}].bullets[${j}]`, message: "Bullet should end with a period" });
      }
    });
  });
  return issues;
}

function checkRequired(cv: CV): Issue[] {
  const issues: Issue[] = [];
  if (!cv.summary || cv.summary.trim() === '') {
    issues.push({ path: 'summary', message: 'Missing professional summary' });
  }
  if (!cv.experience || cv.experience.length === 0) {
    issues.push({ path: 'experience', message: 'Experience section is empty' });
  }
  const skillCount = cv.skills.primary.length + cv.skills.secondary.length + cv.skills.tools.length;
  if (skillCount === 0) {
    issues.push({ path: 'skills', message: 'Skills section is empty' });
  }
  return issues;
}

function checkLinks(cv: CV): Issue[] {
  const issues: Issue[] = [];
  cv.links.forEach((link, i) => {
    if (!URL_RE.test(link.url)) {
      issues.push({ path: `links[${i}].url`, message: 'Invalid link URL' });
    }
  });
  return issues;
}

function checkContacts(cv: CV): Issue[] {
  const issues: Issue[] = [];
  if (!EMAIL_RE.test(cv.email)) {
    issues.push({ path: 'email', message: 'Invalid email format' });
  }
  if (cv.phone && !PHONE_RE.test(cv.phone)) {
    issues.push({ path: 'phone', message: 'Invalid phone number format' });
  }
  return issues;
}

function checkKeywords(cv: CV, ctx: AtsContext): Issue[] {
  const text = JSON.stringify(cv).toLowerCase();
  const source = (ctx.jobDescription || ctx.targetRole).toLowerCase();
  const tokens = Array.from(new Set(source.match(/[a-zA-Z][a-zA-Z0-9+#\.\-]{2,}/g) || []));
  const missing = tokens.filter((t) => !text.includes(t));
  if (missing.length === 0) return [];
  return [
    {
      message: `Missing keywords: ${missing.slice(0, 5).join(', ')}`,
    },
  ];
}

export function runAtsChecks(cv: CV, ctx: AtsContext): AtsResult {
  const weights = {
    required: 20,
    dates: 20,
    bullets: 15,
    links: 10,
    contacts: 10,
    keywords: 25,
  } as const;

  const issues: Issue[] = [];
  let score = 0;

  const req = checkRequired(cv);
  if (req.length === 0) score += weights.required; else issues.push(...req);

  const dates = checkDates(cv);
  if (dates.length === 0) score += weights.dates; else issues.push(...dates);

  const bullets = checkBullets(cv);
  if (bullets.length === 0) score += weights.bullets; else issues.push(...bullets);

  const links = checkLinks(cv);
  if (links.length === 0) score += weights.links; else issues.push(...links);

  const contacts = checkContacts(cv);
  if (contacts.length === 0) score += weights.contacts; else issues.push(...contacts);

  const keywords = checkKeywords(cv, ctx);
  if (keywords.length === 0) score += weights.keywords; else issues.push(...keywords);

  return { score, issues };
}

export function deriveFixHints(issues: Issue[], reasons: string[]): string[] {
  const hints = new Set<string>();
  issues.forEach((i) => hints.add(i.message));
  reasons.forEach((r) => hints.add(r));
  return Array.from(hints);
}
