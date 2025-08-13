/**
 * Single entry point wrapper for OpenAI LLM calls.
 */
import OpenAI from "openai";
import { env } from "../env";
import { forceJsonObject, safeJsonParse } from "./json";

const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

export interface CallParams {
  system: string;
  user: string;
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

/** Calls the OpenAI Responses API with optional JSON guardrails */
export async function callOpenAI<T = unknown>({
  system,
  user,
  jsonMode = true,
  temperature = 0.2,
  maxTokens = 800,
}: CallParams): Promise<T | string> {
  const baseInput = [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];

  let options = {
    model: "gpt-4o-mini",
    temperature,
    max_output_tokens: maxTokens,
    input: baseInput,
    response_format: jsonMode ? { type: "json_object" } : undefined,
  } as const;

  for (let attempt = 0; attempt < 2; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await client.responses.create(options, { signal: controller.signal });
      clearTimeout(timeout);
      const text = res.output_text ?? "";
      if (!jsonMode) return text;
      const forced = forceJsonObject(text);
      const parsed = safeJsonParse<T>(forced);
      if (parsed.ok) return parsed.value;
      // prepare retry prompt
      options = {
        ...options,
        input: [
          { role: "system", content: system },
          {
            role: "user",
            content: `${user}\nThe previous reply was invalid JSON. Respond with valid JSON only.`,
          },
        ],
      };
    } catch (err) {
      clearTimeout(timeout);
      if (attempt === 1) throw err;
    }
  }
  throw new Error("Failed to produce valid JSON");
}
