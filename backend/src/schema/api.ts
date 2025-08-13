/**
 * Central API request/response schemas.
 */
import { z } from "zod";
import { CVSchema } from "./cv";

// Re-export existing pipeline schemas
export {
  PipelineRequestSchema,
  PipelineResponseSchema,
  ExtractionSchema,
  GapAnalysisSchema,
  QuestionsSchema,
  BulletRewriteSchema,
  ScoreSchema,
} from "../schemas";

export type {
  PipelineRequest,
  PipelineResponse,
  Extraction,
  GapAnalysis,
  Questions,
  BulletRewrite,
  Score,
} from "../schemas";

// Placeholders for future endpoint schemas
export const UploadParseRequestSchema = z.any();
export const UploadParseResponseSchema = z.any();

export type UploadParseRequest = z.infer<typeof UploadParseRequestSchema>;
export type UploadParseResponse = z.infer<typeof UploadParseResponseSchema>;

// Extract endpoint schemas
export const ExtractRequestSchema = z.object({
  rawText: z.string(),
  targetRole: z.string().optional(),
  locale: z.enum(["tr", "en"]).optional(),
});

export const ExtractResponseSchema = z.object({
  cv: CVSchema,
});

export type ExtractRequest = z.infer<typeof ExtractRequestSchema>;
export type ExtractResponse = z.infer<typeof ExtractResponseSchema>;

// Gaps endpoint schemas
export const GapsRequestSchema = z.object({
  cv: CVSchema,
  targetRole: z.string().min(2),
  jobDescription: z.string().optional(),
  locale: z.enum(["tr", "en"]).default("en"),
});

export const GapItemSchema = z.object({
  type: z.enum(["MISSING_FIELD", "WEAK_BULLET", "MISSING_KEYWORD"]),
  path: z.string().min(1),
  ask: z.string().min(5),
  why: z.string().optional(),
});

export const GapsResponseSchema = z.object({
  gaps: z.array(GapItemSchema),
  missingKeywords: z.array(z.string()),
});

export type GapsRequest = z.infer<typeof GapsRequestSchema>;
export type GapItem = z.infer<typeof GapItemSchema>;
export type GapsResponse = z.infer<typeof GapsResponseSchema>;

// Questions next endpoint schemas
export const QuestionsNextRequestSchema = z.object({
  gaps: z
    .array(
      z.object({
        type: z.enum(["MISSING_FIELD", "WEAK_BULLET", "MISSING_KEYWORD"]),
        path: z.string().min(1),
        ask: z.string().min(3),
        why: z.string().optional(),
      })
    )
    .min(1),
  alreadyAsked: z.array(z.string()).default([]),
  locale: z.enum(["tr", "en"]).default("en"),
});

export const QuestionSchema = z.object({
  id: z.string().min(6),
  text: z.string().min(3),
  expects: z.enum(["shortText", "number", "multi"]),
  options: z.array(z.string()).optional(),
  path: z.string().optional(),
});

export const QuestionsNextResponseSchema = z.object({
  questions: z.array(QuestionSchema).max(3),
});

export type QuestionsNextRequest = z.infer<typeof QuestionsNextRequestSchema>;
export type Question = z.infer<typeof QuestionSchema>;
export type QuestionsNextResponse = z.infer<typeof QuestionsNextResponseSchema>;
