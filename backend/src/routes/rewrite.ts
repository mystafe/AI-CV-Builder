import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { callOpenAI } from '../lib/openai';
import { safeJsonParse } from '../lib/json';
import {
  RewriteBulletRequestSchema,
  RewriteBulletResponseSchema,
  RewriteBulletRequest,
} from '../schema/api';
import {
  isSingleSentence,
  withinLimits,
  changedMeaning,
  containsFabrication,
  enforceStyle,
} from '../lib/quality';

const promptPath = path.join(__dirname, '../prompts/rewrite_bullet.md');
const promptText = fs.readFileSync(promptPath, 'utf8');
const systemMatch = promptText.match(/SYSTEM:\n"""([\s\S]*?)"""/);
const userMatch = promptText.match(/USER:\n"""([\s\S]*?)"""/);
const SYSTEM_PROMPT = systemMatch ? systemMatch[1].trim() : '';
const USER_TEMPLATE = userMatch ? userMatch[1].trim() : '';

function buildUserPrompt(data: RewriteBulletRequest, note = '') {
  const factsJson = JSON.stringify(data.userFacts, null, 2);
  return USER_TEMPLATE.replace('{{LOCALE}}', data.locale)
    .replace('{{TARGET_ROLE_OR_EMPTY}}', data.targetRole ?? '')
    .replace('{{JOB_DESCRIPTION_OR_EMPTY}}', data.jobDescription ?? '')
    .replace('{{BEFORE_BULLET}}', data.before)
    .replace('{{USER_FACTS_JSON_ARRAY}}', factsJson)
    .concat(note ? `\n${note}` : '');
}

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 5 });

router.post('/bullet', limiter, async (req, res) => {
  const parsed = RewriteBulletRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ error: 'Invalid request', details: parsed.error.format() });
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
        maxTokens: 300,
      });

      let json: unknown = aiResult;
      if (typeof aiResult === 'string') {
        const forced = safeJsonParse<unknown>(aiResult);
        if (!forced.ok) {
          userPrompt = buildUserPrompt(data, '\nReturn ONLY valid JSON.');
          continue;
        }
        json = forced.value;
      }

      const validated = RewriteBulletResponseSchema.safeParse(json);
      if (!validated.success) {
        userPrompt = buildUserPrompt(data, '\nReturn ONLY valid JSON.');
        continue;
      }

      let styled = enforceStyle(validated.data.after.trim(), data.locale);

      if (
        !isSingleSentence(styled) ||
        !withinLimits(styled) ||
        !changedMeaning(data.before, styled)
      ) {
        return res.status(422).json({ error: 'Quality check failed' });
      }

      if (containsFabrication(data.before, styled, data.userFacts)) {
        if (attempt === 0) {
          userPrompt = buildUserPrompt(
            data,
            '\nYour previous answer added unverified details. Use ONLY provided facts and avoid numbers if none supplied.'
          );
          continue;
        }
        return res.status(422).json({ error: 'Possible fabrication detected' });
      }

      return res.json({
        before: data.before,
        after: styled,
        rationale: validated.data.rationale,
      });
    } catch (err) {
      console.error(err);
    }
  }
  res.status(422).json({ error: 'Rewrite failed' });
});

export default router;
