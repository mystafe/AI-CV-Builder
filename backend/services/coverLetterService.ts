import { z } from "zod"
import { buildCoverLetterPrompt } from "../prompts/coverLetter"

export const CoverLetterInput = z.object({
  cv: z.any(),
  targetRole: z.string().min(1),
  company: z.string().optional(),
  sectorId: z.string().optional(),
  lang: z.union([z.literal("tr"), z.literal("en")]).default("tr")
})

function abortSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortController === "undefined") return undefined as any
  const ctrl = new AbortController()
  setTimeout(() => ctrl.abort(), timeoutMs).unref?.()
  return ctrl.signal
}

export async function generateCoverLetter(
  input: z.infer<typeof CoverLetterInput>
): Promise<{ coverLetter: string }> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"
  const system = buildCoverLetterPrompt({
    lang: input.lang || "tr",
    targetRole: input.targetRole,
    company: input.company
  })
  const user = JSON.stringify({ cv: input.cv, sectorId: input.sectorId })
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ],
      temperature: 0
    }),
    signal: abortSignal(30_000)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`openai_failed ${res.status}: ${txt}`)
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content || ""
  return { coverLetter: String(content).trim() }
}
