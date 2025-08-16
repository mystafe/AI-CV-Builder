import express from "express"
import { z } from "zod"

// Reuse shapes close to backend/index.js UnifiedCvSchema to avoid drift
const CvPersonalSchema = z.object({
  fullName: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default("")
})

const CvExperienceSchema = z.object({
  title: z.string().optional().default(""),
  company: z.string().optional().default(""),
  location: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
  current: z.boolean().optional().default(false),
  bullets: z.array(z.string()).optional().default([])
})

const CvEducationSchema = z.object({
  school: z.string().optional().default(""),
  degree: z.string().optional().default(""),
  field: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default("")
})

const CvSkillSchema = z.object({
  name: z.string().optional().default(""),
  level: z.string().optional().default("")
})

const CvCertificationSchema = z.object({
  name: z.string().optional().default(""),
  issuer: z.string().optional().default(""),
  year: z.string().optional().default("")
})

const CvProjectSchema = z.object({
  name: z.string().optional().default(""),
  summary: z.string().optional().default(""),
  tech: z.array(z.string()).optional().default([])
})

const CvLanguageSchema = z.object({
  name: z.string().optional().default(""),
  level: z.string().optional().default("")
})

const CvTargetSchema = z.object({
  role: z.string().optional().default(""),
  seniority: z.string().optional().default(""),
  sector: z.string().optional().default("")
})

export const UnifiedCvSchema = z.object({
  personal: CvPersonalSchema.default({}),
  summary: z.string().optional().default(""),
  experience: z.array(CvExperienceSchema).optional().default([]),
  education: z.array(CvEducationSchema).optional().default([]),
  skills: z.array(CvSkillSchema).optional().default([]),
  certifications: z.array(CvCertificationSchema).optional().default([]),
  projects: z.array(CvProjectSchema).optional().default([]),
  languages: z.array(CvLanguageSchema).optional().default([]),
  target: CvTargetSchema.optional().default({})
})

const TargetSchema = CvTargetSchema

// Input/Output schemas per endpoint
const ParseSchema = z.object({
  text: z.string().optional(),
  filePath: z.string().optional()
})
const SectorQuestionsInput = z.object({
  cv: UnifiedCvSchema,
  target: TargetSchema
})
const SectorQuestionItem = z.object({
  id: z.string(),
  question: z.string(),
  key: z.enum(["metrics", "scope", "tools", "impact", "timeline", "extras"])
})
const SectorQuestionsOutput = z.object({
  questions: z.array(SectorQuestionItem)
})

const SkillAssessGenReq = z.object({
  cv: UnifiedCvSchema,
  target: TargetSchema
})
const SkillAssessGenRes = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      topic: z.string(),
      question: z.string(),
      options: z.array(z.string())
    })
  )
})
const SkillAssessGradeReq = z.object({
  sessionId: z.string(),
  answers: z.array(
    z.object({ id: z.string(), choice: z.enum(["A", "B", "C", "D"]) })
  )
})
const SkillAssessGradeRes = z.object({
  score: z.object({ correct: z.number(), total: z.number(), pct: z.number() }),
  breakdown: z.array(z.object({ id: z.string(), correct: z.boolean() }))
})

const PolishInput = z.object({ cv: UnifiedCvSchema, target: TargetSchema })
const PolishOutput = z.object({
  cv: UnifiedCvSchema,
  notes: z.array(z.string())
})

const AtsInput = z.object({ cv: UnifiedCvSchema, jobText: z.string() })
const AtsOutput = z.object({
  missing: z.array(z.string()),
  suggested: z.array(z.string()),
  score: z.number()
})

const RenderPdfInput = z.object({
  cv: UnifiedCvSchema,
  template: z.enum(["modern", "compact", "classic"])
})
const RenderDocxInput = RenderPdfInput
const FileBinary = z.object({
  filename: z.string(),
  mime: z.string(),
  base64: z.string()
})

const CoverLetterInput = z.object({
  cv: UnifiedCvSchema,
  target: TargetSchema,
  jobText: z.string().optional()
})
const CoverLetterOutput = z.object({ letter: z.string() })

const DraftSaveInput = z.object({
  draftId: z.string().optional(),
  cv: z.any(),
  target: z.any().optional(),
  extras: z.any().optional()
})
const DraftSaveOutput = z.object({
  draftId: z.string(),
  savedAt: z.string(),
  size: z.number()
})
const DraftGetOutput = z.object({
  draftId: z.string(),
  cv: z.any(),
  target: z.any(),
  extras: z.any(),
  savedAt: z.string()
})

const ShareCreateInput = z.object({
  draftId: z.string(),
  ttlDays: z.number().int().min(1).max(30).optional()
})
const ShareCreateOutput = z.object({
  shareId: z.string(),
  shareUrl: z.string(),
  expiresAt: z.string()
})

const FollowupsInput = z.object({
  cv: UnifiedCvSchema,
  target: TargetSchema.optional()
})
const FollowupsOutput = z.object({
  questions: z.array(z.object({ id: z.string(), question: z.string() }))
})

const TypeDetectInput = z.object({ cv: UnifiedCvSchema })
const TypeDetectOutput = z.object({ target: TargetSchema, cv: UnifiedCvSchema })

// Router factory using validation only (handlers are mounted in index.js runtime)
export const apiRouter = express.Router()

// We only validate/describe here; actual logic lives in the runtime server.
// These are placeholder handlers to ensure strict validation in a modular router.

function validate<T extends z.ZodTypeAny>(schema: T) {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const result = schema.safeParse(req.method === "GET" ? req.query : req.body)
    if (!result.success)
      return res
        .status(400)
        .json({ error: "Invalid input", details: result.error.errors })
      // attach parsed for downstream handlers if needed
    ;(req as any).parsed = result.data
    next()
  }
}

// Define routes and attach only validators; implementation should be provided by server binding or replaced here.
apiRouter.post("/parse", validate(ParseSchema), (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post(
  "/sector-questions",
  validate(SectorQuestionsInput),
  (_req, res) => res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post(
  "/skill-assessment/generate",
  validate(SkillAssessGenReq),
  (_req, res) => res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post(
  "/skill-assessment/grade",
  validate(SkillAssessGradeReq),
  (_req, res) => res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post("/polish", validate(PolishInput), (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post("/ats/keywords", validate(AtsInput), (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post("/render/pdf", validate(RenderPdfInput), (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post("/render/docx", validate(RenderDocxInput), (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post("/cover-letter", validate(CoverLetterInput), (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post("/drafts/save", validate(DraftSaveInput), (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.get("/drafts/:id", (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post("/share/create", validate(ShareCreateInput), (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.get("/share/:shareId", (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post("/followups", validate(FollowupsInput), (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)
apiRouter.post("/type-detect", validate(TypeDetectInput), (_req, res) =>
  res.status(501).json({ error: "Not Implemented" })
)

export // Re-export shapes to be shared with client generator
 type {}
