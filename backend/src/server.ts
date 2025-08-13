import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pipelineRouter from './routes/pipeline';
import extractRouter from './routes/extract';
import gapsRouter from './routes/gaps';
import questionsRouter from './routes/questions';

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use('/api', pipelineRouter);
app.use('/api/extract', extractRouter);
app.use('/api/gaps', gapsRouter);
app.use('/api/questions', questionsRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
