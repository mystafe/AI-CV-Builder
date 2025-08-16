import express from "express"
import { z } from "zod"
import { UnifiedCvSchema } from "../domain/cvSchema"
import {
  StartInput,
  AnswerInput,
  startFollowup,
  answerFollowup
} from "../services/followupService"

export const followupRouter = express.Router()

followupRouter.post("/start", async (req, res) => {
  const parsed = StartInput.safeParse(req.body)
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
    const out = await startFollowup(parsed.data)
    return res.status(200).json(out)
  } catch (e: any) {
    return res
      .status(500)
      .json({
        error: {
          code: "followup_start_failed",
          message: e?.message || "failed",
          requestId: (req as any).id
        }
      })
  }
})

followupRouter.post("/answer", async (req, res) => {
  const parsed = AnswerInput.safeParse(req.body)
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
    const out = await answerFollowup(parsed.data)
    return res.status(200).json(out)
  } catch (e: any) {
    const code = e?.message === "session_not_found" ? 404 : 500
    return res
      .status(code)
      .json({
        error: {
          code: "followup_answer_failed",
          message: e?.message || "failed",
          requestId: (req as any).id
        }
      })
  }
})

followupRouter.get("/session/:id", async (req, res) => {
  try {
    const id = req.params.id
    // Lazy import to avoid circular deps
    const store = await import("../domain/sessionStore")
    const sess = store.getSession(id)
    if (!sess)
      return res
        .status(404)
        .json({
          error: {
            code: "not_found",
            message: "session not found",
            requestId: (req as any).id
          }
        })
    // sanitize
    const { sessionId, cv, gaps, asked, answers, createdAt, updatedAt } = sess
    return res
      .status(200)
      .json({ sessionId, cv, gaps, asked, answers, createdAt, updatedAt })
  } catch (e: any) {
    return res
      .status(500)
      .json({
        error: {
          code: "followup_session_failed",
          message: e?.message || "failed",
          requestId: (req as any).id
        }
      })
  }
})

export default followupRouter
