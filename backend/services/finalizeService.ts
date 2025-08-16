import fs from "fs"
import path from "path"
import { z } from "zod"

const MODE_SCHEMA = z.enum(["polish", "rewrite"])

export const FinalizeInput = z.object({
  cv: z.any(),
  mode: MODE_SCHEMA,
  sectorId: z.string().optional(),
  roleId: z.string().optional(),
  seniority: z.string().optional(),
  lang: z.union([z.literal("tr"), z.literal("en")]).default("en")
})

function readPrompt(fileName: string): string {
  const p = path.join(process.cwd(), "backend", "prompts", fileName)
  return fs.readFileSync(p, "utf8")
}

function buildSystemPrompt(mode: "polish" | "rewrite", lang: "tr" | "en") {
  if (mode === "polish") {
    // Reuse polish.md and enforce lang
    return readPrompt("polish.md") + `\nAll output MUST be in ${lang}.`
  }
  // rewrite
  const tr = `Sen ${
    lang === "tr" ? "Türkçe" : "İngilizce"
  } yazan kıdemli bir CV yazarı ve işe alım yöneticisisin. Aşağıdaki CV verisini KESKİN bir şekilde yeniden yaz:
- Gerçeklere sadık kal, YENİ bilgi üretme.
- Tüm bullet'lar: aksiyon fiili + kapsam + yöntem + ölçülebilir etki.
- Zaman uyumu: mevcut rol geniş zaman, geçmiş roller geçmiş zaman.
- ATS uyumlu, net, gereksiz sözcük yok.
- Çıkış formatı: { "cv": <GüncellenmişCV>, "notes": ["kısa not", "kısa not"] }
- Tüm metin dili: ${lang}.`
  const en = `You are a senior resume writer and hiring manager. Aggressively rewrite the CV while keeping ONLY provided facts:
- Do not invent facts.
- Bullets must follow: action verb + scope + method + measurable impact.
- Tense consistency: current role present; past roles past.
- ATS-friendly, concise.
- Output JSON: { "cv": <UpdatedCV>, "notes": ["short note","short note"] }
- Language: ${lang}.`
  return lang === "tr" ? tr : en
}

function abortSignal(timeoutMs: number): AbortSignal | undefined {
  if (typeof AbortController === "undefined") return undefined as any
  const ctrl = new AbortController()
  setTimeout(() => ctrl.abort(), timeoutMs).unref?.()
  return ctrl.signal
}

export async function finalizeCv(
  input: z.infer<typeof FinalizeInput>
): Promise<{ cv: any; notes: string[] }> {
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini"
  const system = buildSystemPrompt(input.mode, input.lang)
  const user = JSON.stringify({
    cv: input.cv,
    target: {
      sectorId: input.sectorId,
      roleId: input.roleId,
      seniority: input.seniority
    }
  })
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
      temperature: input.mode === "rewrite" ? 0.3 : 0,
      response_format: { type: "json_object" }
    }),
    signal: abortSignal(30_000)
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`openai_failed ${res.status}: ${txt}`)
  }
  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content || "{}"
  const json = JSON.parse(content)
  if (!json || typeof json !== "object" || !("cv" in json)) {
    throw new Error("model_invalid_output")
  }
  return { cv: json.cv, notes: Array.isArray(json.notes) ? json.notes : [] }
}
