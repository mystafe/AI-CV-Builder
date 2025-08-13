import { Router } from "express";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { callOpenAI } from "../lib/openai";
import { safeJsonParse } from "../lib/json";
import { CVSchema } from "../schema/cv";
import { ExtractRequestSchema } from "../schema/api";

const promptPath = path.join(__dirname, "../prompts/extract.md");
const promptText = fs.readFileSync(promptPath, "utf8");
const systemMatch = promptText.match(/SYSTEM:\n"""([\s\S]*?)"""/);
const userMatch = promptText.match(/USER:\n"""([\s\S]*?)"""/);
const SYSTEM_PROMPT = systemMatch ? systemMatch[1].trim() : "";
const USER_TEMPLATE = userMatch ? userMatch[1].trim() : "";

function buildUserPromptFromRawText(rawText: string, targetRole?: string, locale?: "tr" | "en") {
  let prompt = USER_TEMPLATE.replace("{{RAW_TEXT}}", rawText);
  if (targetRole) prompt += `\nTarget role: ${targetRole}`;
  if (locale) prompt += `\nLocale: ${locale}`;
  return prompt;
}

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 5 });

router.post("/", limiter, async (req, res) => {
  const parsed = ExtractRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: "Invalid request", details: parsed.error.format() });
  }

  const { rawText, targetRole, locale } = parsed.data;
  const userPrompt = buildUserPromptFromRawText(rawText, targetRole, locale);

  try {
    const result = await callOpenAI<unknown>({
      system: SYSTEM_PROMPT,
      user: userPrompt,
      jsonMode: true,
      temperature: 0.2,
      maxTokens: 1200,
    });

    let data = result as unknown;
    // final safety parse if result came back as string for some reason
    if (typeof result === "string") {
      const forced = safeJsonParse<unknown>(result);
      if (!forced.ok) {
        return res.status(422).json({ error: "Invalid JSON from model" });
      }
      data = forced.value;
    }

    const cvParsed = CVSchema.safeParse(data);
    if (!cvParsed.success) {
      return res
        .status(422)
        .json({ error: "Invalid CV schema", details: cvParsed.error.format() });
    }

    res.json({ cv: cvParsed.data });
  } catch (err) {
    console.error(err);
    res.status(422).json({ error: "Extraction failed" });
  }
});

export default router;
