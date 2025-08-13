import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { PipelineRequestSchema } from '../schemas';
import { runPipeline } from '../pipeline';

const router = Router();
const limiter = rateLimit({ windowMs: 60_000, max: 5 });

router.post('/pipeline', limiter, async (req, res) => {
  const parsed = PipelineRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.format() });
  }
  try {
    const result = await runPipeline(parsed.data);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Pipeline failed' });
  }
});

export default router;
