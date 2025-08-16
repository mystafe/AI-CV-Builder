// Generated API client (mirrors backend/lib/apiClient.ts)
import { z } from "zod"

const jsonHeaders = { "Content-Type": "application/json" }

export type FetchLike = (
  input: RequestInfo,
  init?: RequestInit
) => Promise<Response>

export interface ApiClientOptions {
  baseUrl?: string
  fetch?: FetchLike
}

function makeUrl(base: string, path: string) {
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`
}

export function createApiClient(opts: ApiClientOptions = {}) {
  const base = (opts.baseUrl || "").replace(/\/$/, "")
  const fx: FetchLike = opts.fetch || (globalThis.fetch as any)

  async function postJson<T>(
    path: string,
    body: any,
    headers?: Record<string, string>
  ): Promise<T> {
    const res = await fx(makeUrl(base, path), {
      method: "POST",
      headers: { ...jsonHeaders, ...(headers || {}) },
      body: JSON.stringify(body ?? {})
    })
    const text = await res.text()
    let json: any = {}
    try {
      json = text ? JSON.parse(text) : {}
    } catch {
      json = { error: "invalid_json", raw: text }
    }
    if (!res.ok)
      throw new Error(json?.error || json?.message || "request_failed")
    return json as T
  }

  async function getJson<T>(path: string): Promise<T> {
    const res = await fx(makeUrl(base, path), { method: "GET" })
    if (!res.ok) throw new Error("request_failed")
    return (await res.json()) as T
  }

  const Cv = z.object({
    personal: z.object({
      fullName: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional(),
      location: z.string().optional()
    }),
    summary: z.string().optional(),
    experience: z
      .array(
        z.object({
          title: z.string().optional(),
          company: z.string().optional(),
          location: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional(),
          current: z.boolean().optional(),
          bullets: z.array(z.string()).optional()
        })
      )
      .optional(),
    education: z
      .array(
        z.object({
          school: z.string().optional(),
          degree: z.string().optional(),
          field: z.string().optional(),
          startDate: z.string().optional(),
          endDate: z.string().optional()
        })
      )
      .optional(),
    skills: z
      .array(
        z.object({ name: z.string().optional(), level: z.string().optional() })
      )
      .optional(),
    certifications: z
      .array(
        z.object({
          name: z.string().optional(),
          issuer: z.string().optional(),
          year: z.string().optional()
        })
      )
      .optional(),
    projects: z
      .array(
        z.object({
          name: z.string().optional(),
          summary: z.string().optional(),
          tech: z.array(z.string()).optional()
        })
      )
      .optional(),
    languages: z
      .array(
        z.object({ name: z.string().optional(), level: z.string().optional() })
      )
      .optional(),
    target: z
      .object({
        role: z.string().optional(),
        seniority: z.string().optional(),
        sector: z.string().optional()
      })
      .optional()
  })

  return {
    parse: (input: { text?: string; filePath?: string }) =>
      postJson<{ cv: z.infer<typeof Cv> }>("/api/parse", input),
    sectorQuestions: (input: {
      cv: z.infer<typeof Cv>
      target: { role?: string; seniority?: string; sector?: string }
    }) =>
      postJson<{
        questions: Array<{ id: string; question: string; key: string }>
      }>("/api/sector-questions", input),
    skillAssessment: {
      generate: (
        input: {
          cv: z.infer<typeof Cv>
          target: { role?: string; seniority?: string; sector?: string }
        },
        sessionId?: string
      ) =>
        postJson<{
          questions: Array<{
            id: string
            topic: string
            question: string
            options: string[]
          }>
        }>(
          "/api/skill-assessment/generate",
          input,
          sessionId ? { "X-Session-Id": sessionId } : undefined
        ),
      grade: (input: {
        sessionId: string
        answers: Array<{ id: string; choice: "A" | "B" | "C" | "D" }>
      }) =>
        postJson<{
          score: { correct: number; total: number; pct: number }
          breakdown: Array<{ id: string; correct: boolean }>
        }>("/api/skill-assessment/grade", input)
    },
    polish: (input: { cv: z.infer<typeof Cv>; target: any }) =>
      postJson<{ cv: z.infer<typeof Cv>; notes: string[] }>(
        "/api/polish",
        input
      ),
    atsKeywords: (input: { cv: z.infer<typeof Cv>; jobText: string }) =>
      postJson<{ missing: string[]; suggested: string[]; score: number }>(
        "/api/ats/keywords",
        input
      ),
    render: {
      pdf: (input: {
        cv: z.infer<typeof Cv>
        template: "modern" | "compact" | "classic"
      }) =>
        postJson<{ filename: string; mime: string; base64: string }>(
          "/api/render/pdf",
          input
        ),
      docx: (input: {
        cv: z.infer<typeof Cv>
        template: "modern" | "compact" | "classic"
      }) =>
        postJson<{ filename: string; mime: string; base64: string }>(
          "/api/render/docx",
          input
        )
    },
    coverLetter: (input: {
      cv: z.infer<typeof Cv>
      target: { role?: string; seniority?: string; sector?: string }
      jobText?: string
    }) => postJson<{ letter: string }>("/api/cover-letter", input),
    drafts: {
      save: (input: {
        draftId?: string
        cv: any
        target?: any
        extras?: any
      }) =>
        postJson<{ draftId: string; savedAt: string; size: number }>(
          "/api/drafts/save",
          input
        ),
      get: (draftId: string) =>
        getJson<{
          draftId: string
          cv: any
          target: any
          extras: any
          savedAt: string
        }>(`/api/drafts/${draftId}`)
    },
    share: {
      create: (input: { draftId: string; ttlDays?: number }) =>
        postJson<{ shareId: string; shareUrl: string; expiresAt: string }>(
          "/api/share/create",
          input
        ),
      get: (shareId: string) =>
        getJson<{
          draftId: string
          cv: any
          target: any
          extras: any
          createdAt: string
          expiresAt: string
        }>(`/api/share/${shareId}`)
    },
    followups: (input: {
      cv: z.infer<typeof Cv>
      target?: { role?: string; seniority?: string; sector?: string }
    }) =>
      postJson<{ questions: Array<{ id: string; question: string }> }>(
        "/api/followups",
        input
      ),
    typeDetect: (input: { cv: z.infer<typeof Cv> }) =>
      postJson<{
        target: {
          role?: string
          seniority?: string
          sector?: string
          confidence?: number
        }
        cv: any
      }>("/api/type-detect", input),
    analytics: (input: { type: string; payload?: any }) =>
      postJson<{ ok: true }>("/api/analytics/event", input),
    followup: {
      start: (
        input: {
          cv: any
          sectorId?: string
          roleId?: string
          seniority?: string
        },
        requestId?: string
      ) =>
        postJson<{
          sessionId: string
          nextQuestions: Array<{
            id: string
            target: string
            ask: string
            type: string
            required: boolean
            hints: string[]
          }>
          max_rounds: number
        }>(
          "/api/followup/start",
          input,
          requestId ? { "X-Request-Id": requestId } : undefined
        ),
      answer: (
        input: {
          sessionId: string
          answers: Array<{ id: string; value: any }>
        },
        requestId?: string
      ) =>
        postJson<{
          done: boolean
          nextQuestions: Array<{
            id: string
            target: string
            ask: string
            type: string
            required: boolean
            hints: string[]
          }>
        }>(
          "/api/followup/answer",
          input,
          requestId ? { "X-Request-Id": requestId } : undefined
        ),
      getSession: (sessionId: string, requestId?: string) =>
        getJson<{
          sessionId: string
          cv: any
          gaps: any
          asked: any[]
          answers: any
          createdAt: string
          updatedAt: string
        }>(`/api/followup/session/${sessionId}`)
    },
    finalize: {
      post: (
        input: {
          cv: any
          mode: "polish" | "rewrite"
          sectorId?: string
          roleId?: string
          seniority?: string
          lang?: "tr" | "en"
        },
        requestId?: string
      ) =>
        postJson<{ cv: any; notes: string[] }>(
          "/api/finalize",
          input,
          requestId ? { "X-Request-Id": requestId } : undefined
        )
    },
    coverLetterBuild: (
      input: {
        cv: any
        targetRole: string
        company?: string
        sectorId?: string
        lang?: "tr" | "en"
      },
      requestId?: string
    ) =>
      postJson<{ coverLetter: string }>(
        "/api/cover-letter",
        input,
        requestId ? { "X-Request-Id": requestId } : undefined
      ),
    ats: {
      check: (input: { cv: any; jdKeywords: string[] }, requestId?: string) =>
        postJson<{
          sections_present: Record<string, boolean>
          keyword_hits: Array<{ keyword: string; found_in: string[] }>
          warnings: string[]
          score: number
          scoring_notes: string
        }>(
          "/api/ats/check",
          input,
          requestId ? { "X-Request-Id": requestId } : undefined
        )
    },
    export: {
      adapter: (input: { cv: any }, requestId?: string) =>
        postJson<{
          tpl_personal: any
          tpl_summary: string
          tpl_experience: any[]
          tpl_education: any[]
          tpl_skills: string[]
          tpl_languages: string[]
        }>(
          "/api/export/adapter",
          input,
          requestId ? { "X-Request-Id": requestId } : undefined
        )
    },
    legacy: {
      extractRaw: (input: {
        rawText?: string
        template?: Record<string, any>
      }) => postJson<any>("/api/extract-raw", input),
      ai: {
        parse: (input: { rawText?: string; template?: Record<string, any> }) =>
          postJson<any>("/api/ai/parse", input),
        questions: (input: { cv: any; count?: number }) =>
          postJson<any>("/api/ai/questions", input),
        improve: (input: { cv: any; answers: Record<string, any> }) =>
          postJson<any>("/api/ai/improve", input),
        score: (input: { cv: any }) => postJson<any>("/api/ai/score", input),
        coverletter: (input: { cv: any; roleHint?: string }) =>
          postJson<any>("/api/ai/coverletter", input)
      }
    }
  }
}

export type ApiClient = ReturnType<typeof createApiClient>
