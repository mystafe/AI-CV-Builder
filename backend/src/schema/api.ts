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
