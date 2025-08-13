import { Router } from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { callOpenAI } from "../lib/openai";
import { safeJsonParse } from "../lib/json";
import { stableQuestionId } from "../lib/id";
import {
  QuestionsNextRequestSchema,
  QuestionsNextResponseSchema,
} from "../schema/api";
import type { QuestionsNextRequest } from "../schema/api";

const promptPath = path.join(__dirname, "../prompts/questions.md");
const promptText = fs.readFileSync(promptPath, "utf8");
const systemMatch = promptText.match(/SYSTEM:\n"""([\s\S]*?)"""/);
const userMatch = promptText.match(/USER:\n"""([\s\S]*?)"""/);
const SYSTEM_PROMPT = systemMatch ? systemMatch[1].trim() : "";
const USER_TEMPLATE = userMatch ? userMatch[1].trim() : "";

function buildUserPrompt(data: QuestionsNextRequest, shorten = false) {
  const gapsJson = JSON.stringify(data.gaps, null, 2);
  const gapsPayload = shorten ? gapsJson.slice(0, 2000) : gapsJson;
  const alreadyJson = JSON.stringify(data.alreadyAsked);
  return USER_TEMPLATE.replace("{{LOCALE}}", data.locale)
    .replace("{{GAPS_JSON}}", gapsPayload)
    .replace("{{ALREADY_ASKED_JSON_ARRAY}}", alreadyJson);
}

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 5 });

router.post("/next", limiter, async (req, res) => {
  const parsed = QuestionsNextRequestSchema.safeParse(req.body);
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
        maxTokens: 500,
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

      const validated = QuestionsNextResponseSchema.safeParse(json);
      if (!validated.success) {
        userPrompt = buildUserPrompt(data, true);
        continue;
      }

      const alreadySet = new Set(data.alreadyAsked);
      const processed = validated.data.questions
        .map((q) => ({ ...q, text: q.text.trim() }))
        .filter((q) => q.text.length > 0)
        .map((q) => ({ ...q, id: stableQuestionId({ path: q.path, text: q.text }) }))
        .filter((q) => !alreadySet.has(q.id))
        .slice(0, 3);

      return res.json({ questions: processed });
    } catch (err) {
      console.error(err);
    }
  }

  res.status(422).json({ error: "Question generation failed" });
});

export default router;
