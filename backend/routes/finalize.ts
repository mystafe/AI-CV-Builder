import express from "express"
import { z } from "zod"
import { UnifiedCvSchema } from "../domain/cvSchema"
import { FinalizeInput, finalizeCv } from "../services/finalizeService"

export const finalizeRouter = express.Router()

finalizeRouter.post("/", async (req, res) => {
  const parsed = FinalizeInput.safeParse(req.body)
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
    const out = await finalizeCv(parsed.data)
    return res.status(200).json(out)
  } catch (e: any) {
    return res
      .status(500)
      .json({
        error: {
          code: "finalize_failed",
          message: e?.message || "failed",
          requestId: (req as any).id
        }
      })
  }
})

export default finalizeRouter
