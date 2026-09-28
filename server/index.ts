import express, { Express } from 'express';
import apiRouter from './routes/api';

export function createServerApp(): Express {
  const app = express();
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // Mount API router
  app.use('/api', apiRouter);

  return app;
}

export default createServerApp();
