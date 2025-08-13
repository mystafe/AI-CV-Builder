import { Router } from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { callOpenAI } from "../lib/openai";
import { safeJsonParse } from "../lib/json";
import { runAtsChecks, deriveFixHints } from "../lib/ats";
import { ScoreRequestSchema } from "../schema/api";
import type { ScoreRequest } from "../schema/api";

const promptPath = path.join(__dirname, "../prompts/rolefit.md");
const promptText = fs.readFileSync(promptPath, "utf8");
const systemMatch = promptText.match(/SYSTEM:\n"""([\s\S]*?)"""/);
const userMatch = promptText.match(/USER:\n"""([\s\S]*?)"""/);
const SYSTEM_PROMPT = systemMatch ? systemMatch[1].trim() : "";
const USER_TEMPLATE = userMatch ? userMatch[1].trim() : "";

function buildUserPrompt(data: ScoreRequest) {
  const cvJson = JSON.stringify(data.cv, null, 2);
  const jd = data.jobDescription || "";
  return USER_TEMPLATE.replace("{{TARGET_ROLE}}", data.targetRole)
    .replace("{{LOCALE}}", data.locale)
    .replace("{{JOB_DESCRIPTION_OR_EMPTY}}", jd)
    .replace("{{CV_JSON}}", cvJson);
}

const RoleFitSchema = z.object({
  roleFitScore: z.number().min(0).max(100),
  reasons: z.array(z.string()),
});

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 5 });

router.post("/", limiter, async (req, res) => {
  const parsed = ScoreRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.format() });
  }
  const data = parsed.data;

  const ats = runAtsChecks(data.cv, { targetRole: data.targetRole, jobDescription: data.jobDescription });

  let roleFitScore = 50;
  let reasons: string[] = [];
  const userPrompt = buildUserPrompt(data);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ai = await callOpenAI<{ roleFitScore: number; reasons: string[] }>({
        system: SYSTEM_PROMPT,
        user: userPrompt,
        jsonMode: true,
        temperature: 0.2,
        maxTokens: 300,
      });

      let json: any = ai;
      if (typeof ai === "string") {
        const parsedAi = safeJsonParse<{ roleFitScore: number; reasons: string[] }>(ai);
        if (!parsedAi.ok) continue;
        json = parsedAi.value;
      }
      const valid = RoleFitSchema.safeParse(json);
      if (!valid.success) continue;
      roleFitScore = valid.data.roleFitScore;
      reasons = valid.data.reasons;
      break;
    } catch (err) {
      if (attempt === 1) {
        console.error(err);
      }
    }
  }

  const fixHints = deriveFixHints(ats.issues, reasons);
  return res.json({
    atsScore: ats.score,
    roleFitScore,
    issues: ats.issues,
    fixHints,
  });
});

export default router;
