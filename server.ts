import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './server/routes/api';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Mount API routes
app.use('/api', apiRouter);

// Serve built client assets
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all other GET requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NyayaVault server running on http://0.0.0.0:${PORT}`);
});
