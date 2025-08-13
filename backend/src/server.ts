import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pipelineRouter from './routes/pipeline';

const app = express();
const port = process.env.PORT || 5001;

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use('/api', pipelineRouter);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`server listening on http://localhost:${port}`);
});
