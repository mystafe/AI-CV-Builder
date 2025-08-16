import express from "express"
import {
  CoverLetterInput,
  generateCoverLetter
} from "../services/coverLetterService"

export const coverLetterRouter = express.Router()

coverLetterRouter.post("/", async (req, res) => {
  const parsed = CoverLetterInput.safeParse(req.body)
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
    const out = await generateCoverLetter(parsed.data)
    return res.status(200).json(out)
  } catch (e: any) {
    return res
      .status(500)
      .json({
        error: {
          code: "cover_letter_failed",
          message: e?.message || "failed",
          requestId: (req as any).id
        }
      })
  }
})

export default coverLetterRouter
