import { z } from 'zod';

export const PipelineRequestSchema = z.object({
  cvText: z.string().min(1, 'cvText is required'),
  template: z.record(z.string(), z.any()),
  appLanguage: z.string().default('en'),
});
export type PipelineRequest = z.infer<typeof PipelineRequestSchema>;

export const ExtractionSchema = z.record(z.string(), z.any());
export type Extraction = z.infer<typeof ExtractionSchema>;

export const GapAnalysisSchema = z.object({
  gaps: z.array(z.string()),
});
export type GapAnalysis = z.infer<typeof GapAnalysisSchema>;

export const QuestionsSchema = z.object({
  questions: z.array(z.string()),
});
export type Questions = z.infer<typeof QuestionsSchema>;

export const BulletRewriteSchema = z.object({
  bullets: z.array(z.string()),
});
export type BulletRewrite = z.infer<typeof BulletRewriteSchema>;

export const ScoreSchema = z.object({
  score: z.number().min(0).max(100),
  comment: z.string(),
});
export type Score = z.infer<typeof ScoreSchema>;

export const PipelineResponseSchema = z.object({
  extracted: ExtractionSchema,
  gaps: GapAnalysisSchema,
  questions: QuestionsSchema,
  rewritten: BulletRewriteSchema,
  score: ScoreSchema,
});
export type PipelineResponse = z.infer<typeof PipelineResponseSchema>;
