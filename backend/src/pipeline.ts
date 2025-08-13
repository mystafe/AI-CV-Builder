import OpenAI from 'openai';
import { PipelineRequest, Extraction, GapAnalysis, Questions, BulletRewrite, Score, ExtractionSchema, GapAnalysisSchema, QuestionsSchema, BulletRewriteSchema, ScoreSchema, PipelineResponse, PipelineResponseSchema } from './schemas';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function extract({ cvText, template }: PipelineRequest): Promise<Extraction> {
  const prompt = `Extract the following CV text into JSON matching this template: ${JSON.stringify(template)}. Return only JSON.`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  const content = resp.choices[0].message.content ?? '{}';
  return ExtractionSchema.parse(JSON.parse(content));
}

async function gapAnalysis(cv: Extraction, appLanguage: string): Promise<GapAnalysis> {
  const prompt = `Identify missing or weak sections in this CV JSON. Respond with {"gaps":[]}. CV:${JSON.stringify(cv)}`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  const content = resp.choices[0].message.content ?? '{}';
  return GapAnalysisSchema.parse(JSON.parse(content));
}

async function targetedQuestions(cv: Extraction, gaps: GapAnalysis, appLanguage: string): Promise<Questions> {
  const prompt = `Based on CV JSON and its gaps, ask up to 5 questions to fill the gaps. Respond with {"questions":[]}. CV:${JSON.stringify(cv)} GAPS:${JSON.stringify(gaps.gaps)}`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  const content = resp.choices[0].message.content ?? '{}';
  return QuestionsSchema.parse(JSON.parse(content));
}

function collectBullets(cv: Extraction): string[] {
  const bullets: string[] = [];
  const experience = (cv as any).experience as any[] | undefined;
  experience?.forEach(exp => {
    if (Array.isArray(exp?.bullets)) bullets.push(...exp.bullets.filter((b: unknown): b is string => typeof b === 'string'));
  });
  return bullets;
}

async function rewriteBullets(cv: Extraction): Promise<BulletRewrite> {
  const bullets = collectBullets(cv);
  const prompt = `Rewrite each bullet to be concise and action-oriented. Return {"bullets":[]}. BULLETS:${JSON.stringify(bullets)}`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  const content = resp.choices[0].message.content ?? '{}';
  return BulletRewriteSchema.parse(JSON.parse(content));
}

async function scoreCv(cv: Extraction, appLanguage: string): Promise<Score> {
  const prompt = `Score this CV from 0-100 and provide short comment in ${appLanguage}. Return {"score":number,"comment":string}. CV:${JSON.stringify(cv)}`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
  });
  const content = resp.choices[0].message.content ?? '{}';
  return ScoreSchema.parse(JSON.parse(content));
}

export async function runPipeline(req: PipelineRequest): Promise<PipelineResponse> {
  const extracted = await extract(req);
  const gaps = await gapAnalysis(extracted, req.appLanguage);
  const questions = await targetedQuestions(extracted, gaps, req.appLanguage);
  const rewritten = await rewriteBullets(extracted);
  const score = await scoreCv(extracted, req.appLanguage);
  return PipelineResponseSchema.parse({ extracted, gaps, questions, rewritten, score });
}
