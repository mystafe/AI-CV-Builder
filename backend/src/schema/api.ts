/**
 * Central API request/response schemas.
 */
import { z } from "zod";

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
