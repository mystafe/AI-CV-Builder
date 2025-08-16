import express from "express"
import { z } from "zod"
import { AtsCheckInput, analyzeATS } from "../services/atsService"

export const atsRouter = express.Router()

atsRouter.post("/check", async (req, res) => {
  const parsed = AtsCheckInput.safeParse(req.body)
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
    const out = analyzeATS(parsed.data)
    return res.status(200).json(out)
  } catch (e: any) {
    return res
      .status(500)
      .json({
        error: {
          code: "ats_check_failed",
          message: e?.message || "failed",
          requestId: (req as any).id
        }
      })
  }
})

export default atsRouter
