import express from "express"
import { z } from "zod"
import { UnifiedCvSchema } from "../domain/cvSchema"
import { analyze } from "../services/gapService"

export const gapRouter = express.Router()

const bodySchema = z.object({
  cv: UnifiedCvSchema,
  sectorId: z.string().optional(),
  roleId: z.string().optional(),
  seniority: z.string().optional()
})

gapRouter.post("/analyze", async (req, res) => {
  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    return res
      .status(400)
      .json({
        error: {
          code: "bad_request",
          message: "Invalid input",
          requestId: (req as any).id
        }
      })
  }
  try {
    const out = await analyze(parsed.data)
    return res.status(200).json(out)
  } catch (e: any) {
    return res
      .status(500)
      .json({
        error: {
          code: "gap_analyze_failed",
          message: e?.message || "failed",
          requestId: (req as any).id
        }
      })
  }
})

export default gapRouter
