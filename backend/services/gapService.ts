import { Cv, UnifiedCvSchema } from "../domain/cvSchema"
import { expandSynonyms, resolveRole } from "../domain/sectorTaxonomy"

type AnalyzeInput = {
  cv: Cv
  sectorId?: string
  roleId?: string
  seniority?: string
}

export async function analyze({
  cv,
  sectorId,
  roleId,
  seniority
}: AnalyzeInput) {
  // Missing checks
  const missing: any = {
    personal: [],
    experience: [],
    education: [],
    skills: [],
    languages: []
  }
  const weak_content: any = { summary: [], experience: [] }

  // personal
  if (!cv.personal?.email) missing.personal.push("email")
  if (!cv.personal?.phone)
    missing.personal
      .push("phone")
      (
        // experience
        cv.experience || []
      )
      .forEach((e, idx) => {
        const m: string[] = []
        if (!e.startDate) m.push("startDate")
        if (!e.endDate && !e.current) m.push("endDate")
        if (!e.location) m.push("location")
        if (!Array.isArray(e.bullets) || e.bullets.length < 2) m.push("bullets")
        if (m.length) missing.experience.push({ index: idx, missing: m })

        const issues: string[] = []
        if (!Array.isArray(e.bullets) || e.bullets.length === 0) {
          issues.push("empty_bullets")
        } else {
          const hasNumber = e.bullets.some((b) => /\d/.test(b))
          if (!hasNumber) issues.push("no_metrics")
          const tasky = e.bullets.every((b) =>
            /responsible for|tasked with|duty|görev/i.test(b)
          )
          if (tasky) issues.push("task_like")
        }
        if (issues.length) weak_content.experience.push({ index: idx, issues })
      })
      (
        // education
        cv.education || []
      )
      .forEach((e, idx) => {
        const m: string[] = []
        if (!e.startDate) m.push("startDate")
        if (m.length) missing.education.push({ index: idx, missing: m })
      })
      (
        // skills levels
        cv.skills || []
      )
      .forEach((s, idx) => {
        if (!s.level) missing.skills.push({ index: idx, missing: ["level"] })
      })

  // summary
  const sum = (cv.summary || "").trim()
  if (sum.length === 0) weak_content.summary.push("empty")
  else if (sum.length < 200) weak_content.summary.push("too_short")

  // sector role enrichment
  const role = sectorId && roleId ? resolveRole(sectorId, roleId) : null
  const keywords = role ? role.core_skills : []
  const expanded = keywords.length ? expandSynonyms(keywords) : []

  // keyword hits
  const keyword_hits: Array<{ keyword: string; found_in: string[] }> = []
  if (expanded.length) {
    const haystacks = {
      summary: sum.toLowerCase(),
      skills: (cv.skills || [])
        .map((s) => (s.name || "").toLowerCase())
        .join(" "),
      experience: (cv.experience || [])
        .map((e) => (e.bullets || []).join(" "))
        .join(" ")
        .toLowerCase()
    }
    for (const kw of expanded) {
      const foundIn: string[] = []
      if (haystacks.summary.includes(kw)) foundIn.push("summary")
      if (haystacks.skills.includes(kw)) foundIn.push("skills")
      if (haystacks.experience.includes(kw)) foundIn.push("experience")
      if (foundIn.length) keyword_hits.push({ keyword: kw, found_in: foundIn })
    }
  }

  // suggestions from followup templates
  const suggestions: string[] = []
  if (role && role.followup_templates) {
    if (
      weak_content.experience.some((x: any) => x.issues.includes("no_metrics"))
    ) {
      suggestions.push(role.followup_templates.impact)
    }
    if (missing.skills.length > 0) {
      suggestions.push(role.followup_templates.reliability)
    }
    // scale prompt if bullets missing or too short summary
    if (
      (missing.experience as any[]).some((x) =>
        x.missing.includes("bullets")
      ) ||
      weak_content.summary.includes("too_short")
    ) {
      suggestions.push(role.followup_templates.scale)
    }
  }

  // priority order
  const priority_order = [
    "personal.email",
    "summary",
    "experience[0].bullets",
    "experience[0].startDate",
    "skills[0].level"
  ]

  return {
    missing,
    weak_content,
    keyword_hits,
    suggestions,
    priority_order,
    sector: {
      sectorId: sectorId || "",
      roleId: roleId || "",
      seniority: seniority || ""
    }
  }
}
