import { z } from "zod"
import { UnifiedCvSchema } from "../domain/cvSchema"
import {
  createSession,
  getSession,
  updateSession,
  FollowupSession
} from "../domain/sessionStore"
import { analyze } from "./gapService"

export const StartInput = z.object({
  cv: UnifiedCvSchema,
  sectorId: z.string().optional(),
  roleId: z.string().optional(),
  seniority: z.string().optional()
})

export const AnswerInput = z.object({
  sessionId: z.string().min(1),
  answers: z.array(z.object({ id: z.string().min(1), value: z.any() }))
})

type Question = {
  id: string
  target: string
  ask: string
  type: "short_text" | "long_text"
  required: boolean
  hints: string[]
}

function languageOf(cv: any): "tr" | "en" {
  const s = (cv?.summary || "").toLowerCase()
  if (/ [ığüşöç]/.test(s) || / türk|istanbul|ankara/.test(s)) return "tr"
  return "en"
}

function buildQuestions(cv: any, gaps: any): Question[] {
  const lang = languageOf(cv)
  const t = (tr: string, en: string) => (lang === "tr" ? tr : en)
  const qs: Question[] = []
  // contact
  if (gaps?.missing?.personal?.includes("email")) {
    qs.push({
      id: "q_email",
      target: "personal.email",
      ask: t(
        "E-posta adresinizi paylaşır mısınız?",
        "What is your email address?"
      ),
      type: "short_text",
      required: true,
      hints: []
    })
  }
  if (gaps?.missing?.personal?.includes("phone")) {
    qs.push({
      id: "q_phone",
      target: "personal.phone",
      ask: t(
        "Telefon numaranızı ekler misiniz?",
        "Please provide your phone number."
      ),
      type: "short_text",
      required: true,
      hints: []
    })
  }
  // summary
  if (
    Array.isArray(gaps?.weak_content?.summary) &&
    gaps.weak_content.summary.includes("empty")
  ) {
    qs.push({
      id: "q_summary",
      target: "summary",
      ask: t(
        "Kısa bir özet yazar mısınız? 2-3 cümle.",
        "Add a concise professional summary (2-3 sentences)."
      ),
      type: "long_text",
      required: true,
      hints: []
    })
  }
  // experience metrics
  const expGaps = Array.isArray(gaps?.missing?.experience)
    ? gaps.missing.experience
    : []
  if (expGaps[0] && expGaps[0].missing.includes("bullets")) {
    qs.push({
      id: "q_exp0_bullets",
      target: "experience[0].bullets",
      ask: t(
        "Son rolde 2-3 ölçülebilir başarı yazar mısınız?",
        "Provide 2-3 measurable achievements for your latest role."
      ),
      type: "long_text",
      required: true,
      hints: []
    })
  }
  return qs.slice(0, 3)
}

function applyAnswersToCv(
  cv: any,
  answers: Array<{ id: string; value: any }>,
  questions: Question[]
): any {
  const targetById = new Map(questions.map((q) => [q.id, q.target]))
  const out = JSON.parse(JSON.stringify(cv))
  for (const a of answers) {
    const target = targetById.get(a.id)
    if (!target) continue
    // simple dot/array path setter
    const set = (obj: any, path: string, value: any) => {
      const parts = path.replace(/\]/g, "").split(/\.|\[/)
      let cur = obj
      for (let i = 0; i < parts.length - 1; i++) {
        const k = parts[i]
        if (!(k in cur)) cur[k] = /^[0-9]+$/.test(parts[i + 1]) ? [] : {}
        cur = cur[k]
      }
      const last = parts[parts.length - 1]
      cur[last] = value
    }
    set(out, target, a.value)
  }
  return out
}

export async function startFollowup(input: z.infer<typeof StartInput>) {
  const gaps = await analyze({
    cv: input.cv,
    sectorId: input.sectorId,
    roleId: input.roleId,
    seniority: input.seniority
  })
  const nextQuestions = buildQuestions(input.cv, gaps)
  const sess = createSession({
    cv: input.cv,
    gaps,
    asked: nextQuestions.map((q) => ({ id: q.id, target: q.target })),
    answers: {}
  })
  return { sessionId: sess.sessionId, nextQuestions, max_rounds: 2 }
}

export async function answerFollowup(input: z.infer<typeof AnswerInput>) {
  const sess = getSession(input.sessionId)
  if (!sess) throw new Error("session_not_found")
  const askedIds = sess.asked.map((a) => a.id)
  const relevant = input.answers.filter((a) => askedIds.includes(a.id))
  // rebuild question list based on previous gaps
  const prevQuestions = buildQuestions(sess.cv, sess.gaps)
  const cvUpdated = applyAnswersToCv(sess.cv, relevant, prevQuestions)
  const gaps = await analyze({ cv: cvUpdated })
  const nextQuestions = buildQuestions(cvUpdated, gaps)
  const updated = updateSession(input.sessionId, {
    cv: cvUpdated,
    gaps,
    asked: Array.from(
      new Map(
        [
          ...sess.asked,
          ...nextQuestions.map((q) => ({ id: q.id, target: q.target }))
        ].map((x) => [x.target, x])
      ).values()
    ),
    answers: {
      ...sess.answers,
      ...Object.fromEntries(relevant.map((a) => [a.id, a.value]))
    }
  })
  return { done: nextQuestions.length === 0, nextQuestions }
}
