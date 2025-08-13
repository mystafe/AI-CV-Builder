import { Router } from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { callOpenAI } from "../lib/openai";
import { safeJsonParse } from "../lib/json";
import { normalizeJobDescription } from "../lib/text";
import { GapsRequestSchema, GapsResponseSchema } from "../schema/api";
import type { GapsRequest } from "../schema/api";

const promptPath = path.join(__dirname, "../prompts/gaps.md");
const promptText = fs.readFileSync(promptPath, "utf8");
const systemMatch = promptText.match(/SYSTEM:\n"""([\s\S]*?)"""/);
const userMatch = promptText.match(/USER:\n"""([\s\S]*?)"""/);
const SYSTEM_PROMPT = systemMatch ? systemMatch[1].trim() : "";
const USER_TEMPLATE = userMatch ? userMatch[1].trim() : "";

function buildUserPrompt(data: GapsRequest, shorten = false) {
  const jd = data.jobDescription ? normalizeJobDescription(data.jobDescription) : "";
  const cvJson = JSON.stringify(data.cv, null, 2);
  const cvPayload = shorten ? cvJson.slice(0, 2000) : cvJson;
  return USER_TEMPLATE.replace("{{TARGET_ROLE}}", data.targetRole)
    .replace("{{LOCALE}}", data.locale)
    .replace("{{JOB_DESCRIPTION_OR_EMPTY}}", jd)
    .replace("{{CV_JSON}}", cvPayload);
}

function pathExists(obj: any, p: string): boolean {
  const parts = p.replace(/\[(\d+)\]/g, ".$1").split(".");
  let cur: any = obj;
  for (const part of parts) {
    if (part === "") continue;
    if (Array.isArray(cur)) {
      const idx = Number(part);
      if (Number.isNaN(idx) || !(idx in cur)) return false;
      cur = cur[idx];
    } else if (cur && typeof cur === "object" && part in cur) {
      cur = (cur as any)[part];
    } else {
      return false;
    }
  }
  return true;
}

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 5 });

router.post("/", limiter, async (req, res) => {
  const parsed = GapsRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid request", details: parsed.error.format() });
  }

  const data = parsed.data;
  let userPrompt = buildUserPrompt(data);

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const aiResult = await callOpenAI<unknown>({
        system: SYSTEM_PROMPT,
        user: userPrompt,
        jsonMode: true,
        temperature: 0.2,
        maxTokens: 800,
      });

      let json: unknown = aiResult;
      if (typeof aiResult === "string") {
        const forced = safeJsonParse<unknown>(aiResult);
        if (!forced.ok) {
          userPrompt = buildUserPrompt(data, true);
          continue;
        }
        json = forced.value;
      }

      const validated = GapsResponseSchema.safeParse(json);
      if (!validated.success) {
        userPrompt = buildUserPrompt(data, true);
        continue;
      }

      const validGaps = validated.data.gaps.filter((g) => pathExists(data.cv, g.path));
      return res.json({ gaps: validGaps, missingKeywords: validated.data.missingKeywords });
    } catch (err) {
      console.error(err);
    }
  }

  res.status(422).json({ error: "Gap analysis failed" });
});

export default router;
