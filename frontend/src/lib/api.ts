import { z } from "zod";

const API = process.env.NEXT_PUBLIC_API_URL!;

async function fetchJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

const ExtractResponse = z.object({ cv: z.any() });
const GapsResponse = z.object({ gaps: z.array(z.any()) });
const QuestionsNextResponse = z.object({ questions: z.array(z.any()) });
const RewriteBulletResponse = z.object({ after: z.string() });
const ScoreResponse = z.object({
  atsScore: z.number().optional(),
  roleFitScore: z.number().optional(),
  issues: z.array(z.object({ path: z.string().optional(), message: z.string() })).optional(),
  fixHints: z.array(z.string()).optional()
});

export type ExtractResponseType = z.infer<typeof ExtractResponse>;
export type GapsResponseType = z.infer<typeof GapsResponse>;
export type QuestionsNextResponseType = z.infer<typeof QuestionsNextResponse>;
export type RewriteBulletResponseType = z.infer<typeof RewriteBulletResponse>;
export type ScoreResponseType = z.infer<typeof ScoreResponse>;

export async function extract(text: string) {
  const data = await fetchJson<unknown>("/api/extract", { text });
  return ExtractResponse.parse(data);
}

export async function getGaps(cv: unknown) {
  const data = await fetchJson<unknown>("/api/gaps", { cv });
  return GapsResponse.parse(data);
}

export async function getNextQuestions(gaps: unknown, asked: string[]) {
  const data = await fetchJson<unknown>("/api/questions/next", { gaps, asked });
  return QuestionsNextResponse.parse(data);
}

export async function rewriteBullet(params: {
  before: string;
  userFacts?: string[];
  targetRole?: string;
  jobDescription?: string;
  locale?: 'tr' | 'en';
}) {
  const data = await fetchJson<unknown>("/api/rewrite/bullet", {
    userFacts: [],
    ...params,
  });
  return RewriteBulletResponse.parse(data);
}

export async function getScore(cv: unknown) {
  const data = await fetchJson<unknown>("/api/score", { cv });
  return ScoreResponse.parse(data);
}
