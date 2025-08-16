import express from "express"
import { z } from "zod"
import { UnifiedCvSchema } from "../domain/cvSchema"
import { adaptForTemplate } from "../services/exportAdapter"

export const exportRouter = express.Router()

const BodySchema = z.object({ cv: UnifiedCvSchema })

exportRouter.post("/adapter", async (req, res) => {
  const parsed = BodySchema.safeParse(req.body)
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
    const out = adaptForTemplate(parsed.data.cv)
    return res.status(200).json(out)
  } catch (e: any) {
    return res
      .status(500)
      .json({
        error: {
          code: "export_adapter_failed",
          message: e?.message || "failed",
          requestId: (req as any).id
        }
      })
  }
})

export default exportRouter
