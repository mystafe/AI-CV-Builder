import { z } from "zod"
import { UnifiedCvSchema } from "../domain/cvSchema"

export const AtsCheckInput = z.object({
  cv: UnifiedCvSchema,
  jdKeywords: z.array(z.string().min(1)).nonempty()
})

type KeywordHit = { keyword: string; found_in: string[] }

export function analyzeATS(input: z.infer<typeof AtsCheckInput>): {
  sections_present: Record<string, boolean>
  keyword_hits: KeywordHit[]
  warnings: string[]
  score: number
  scoring_notes: string
} {
  const { cv, jdKeywords } = input
  // sections
  const sections_present = {
    personal:
      !!cv.personal &&
      (!!cv.personal.fullName ||
        !!cv.personal.email ||
        !!cv.personal.phone ||
        !!cv.personal.location),
    summary: !!(cv.summary && cv.summary.trim().length > 0),
    experience: Array.isArray(cv.experience) && cv.experience.length > 0,
    education: Array.isArray(cv.education) && cv.education.length > 0,
    skills: Array.isArray(cv.skills) && cv.skills.length > 0
  }

  // keyword hits
  const hits: KeywordHit[] = []
  const lc = (s: string) => (s || "").toLowerCase()
  const haySummary = lc(cv.summary || "")
  const haySkills = (cv.skills || []).map((s) => lc(s.name || "")).join(" ")
  const exp = Array.isArray(cv.experience) ? cv.experience : []
  const hayBullets: Array<{ idx: number; bi: number; text: string }> = []
  exp.forEach((e, idx) =>
    (e.bullets || []).forEach((b, bi) =>
      hayBullets.push({ idx, bi, text: lc(b) })
    )
  )

  const uniqueKw = Array.from(new Set(jdKeywords.map((k) => lc(k))))
  for (const kw of uniqueKw) {
    const foundIn: string[] = []
    if (kw && haySummary.includes(kw)) foundIn.push("summary")
    if (kw && haySkills.includes(kw)) foundIn.push("skills")
    for (const hb of hayBullets) {
      if (kw && hb.text.includes(kw))
        foundIn.push(`experience[${hb.idx}].bullets[${hb.bi}]`)
    }
    if (foundIn.length) hits.push({ keyword: kw, found_in: foundIn })
  }

  // warnings
  const warnings: string[] = []
  const anyMetric = hayBullets.some((b) => /\d/.test(b.text))
  if (!anyMetric) warnings.push("no metrics in bullets")
  const anyMissingDates = exp.some(
    (e) => !e.startDate || (!e.endDate && !e.current)
  )
  if (anyMissingDates) warnings.push("missing dates")
  if (!sections_present.summary || (cv.summary || "").trim().length < 80)
    warnings.push("short or missing summary")
  const anySkillNoLevel = (cv.skills || []).some((s) => !(s.level || "").trim())
  if (anySkillNoLevel) warnings.push("skills without level")

  // scoring
  let score = 50
  const presentCount = Object.values(sections_present).filter(Boolean).length
  score += Math.round((presentCount / 5) * 30) // up to +30
  const hitCount = hits.length
  score += Math.round((hitCount / Math.max(1, uniqueKw.length)) * 40) // up to +40
  if (anyMetric) score += 10
  if (!anyMissingDates) score += 10
  score = Math.max(0, Math.min(100, score))

  const scoring_notes = `sections: ${presentCount}/5; keywords: ${hitCount}/${
    uniqueKw.length
  }; metrics: ${anyMetric ? "yes" : "no"}; dates: ${
    anyMissingDates ? "partial" : "ok"
  }`

  return {
    sections_present,
    keyword_hits: hits,
    warnings,
    score,
    scoring_notes
  }
}
