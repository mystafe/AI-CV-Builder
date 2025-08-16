import { UnifiedCvSchema, Cv } from "../domain/cvSchema"

function parseYyyyMm(s?: string): Date | null {
  if (!s) return null
  const t = s.trim()
  if (!t) return null
  // Accept YYYY or YYYY-MM
  const m = /^([0-9]{4})(?:-([0-9]{2}))?$/.exec(t)
  if (!m) return null
  const year = Number(m[1])
  const month = m[2] ? Number(m[2]) : 1
  if (year < 1900 || year > 3000) return null
  const mm = Math.min(Math.max(month, 1), 12)
  // Use first day of month for diff calculations
  return new Date(Date.UTC(year, mm - 1, 1))
}

function monthsDiff(a: Date, b: Date): number {
  const years = b.getUTCFullYear() - a.getUTCFullYear()
  const months = b.getUTCMonth() - a.getUTCMonth()
  return years * 12 + months
}

export function adaptForTemplate(cv: Cv) {
  const safe = UnifiedCvSchema.parse(cv || {})

  const tpl_personal = {
    fullName: safe.personal.fullName || "",
    email: safe.personal.email || "",
    phone: safe.personal.phone || "",
    location: safe.personal.location || ""
  }

  const tpl_summary = safe.summary || ""

  const now = new Date()
  const tpl_experience = (safe.experience || []).map((e) => {
    const dStart = parseYyyyMm(e.startDate || "")
    const dEnd = e.current ? now : parseYyyyMm(e.endDate || "")
    let tenureMonths: number | null = null
    if (dStart && dEnd) {
      tenureMonths = Math.max(0, monthsDiff(dStart, dEnd))
    }
    const period = `${e.startDate || ""} → ${
      e.current ? "Present" : e.endDate || ""
    }`.trim()
    const bullets = Array.isArray(e.bullets) ? e.bullets.filter(Boolean) : []
    return {
      company: e.company || "",
      title: e.title || "",
      period,
      location: e.location || "",
      bullets,
      tenureMonths
    }
  })

  const tpl_education = (safe.education || []).map((ed) => {
    const period = `${ed.startDate || ""} → ${ed.endDate || ""}`.trim()
    return {
      school: ed.school || "",
      degree: ed.degree || "",
      field: ed.field || "",
      period
    }
  })

  const tpl_skills = (safe.skills || [])
    .map((s) => s.name || "")
    .filter(Boolean)
  const tpl_languages = (safe.languages || [])
    .map((l) => {
      const n = l.name || ""
      const lev = l.level ? ` (${l.level})` : ""
      return `${n}${lev}`.trim()
    })
    .filter(Boolean)

  return {
    tpl_personal,
    tpl_summary,
    tpl_experience,
    tpl_education,
    tpl_skills,
    tpl_languages
  }
}
