import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import connectDB from './config/db.js';
import contactRoutes from './routes/contact.js';
import authRoutes, { seedAdminIfNeeded } from './routes/auth.js';
import profileRoutes, { seedProfileIfNeeded } from './routes/profile.js';
import projectRoutes, { seedProjectsIfNeeded } from './routes/projects.js';
import experienceRoutes, { seedExperiencesIfNeeded } from './routes/experiences.js';
import startupRoutes, { seedStartupsIfNeeded } from './routes/startups.js';
import skillRoutes, { seedSkillsIfNeeded } from './routes/skills.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

// Cached DB connection promise for serverless reuse
let dbReady: Promise<void> | null = null;
function ensureDB() {
  if (!dbReady) {
    dbReady = connectDB().then(async () => {
      await seedAdminIfNeeded();
      await seedProfileIfNeeded();
      await seedProjectsIfNeeded();
      await seedExperiencesIfNeeded();
      await seedStartupsIfNeeded();
      await seedSkillsIfNeeded();
    });
  }
  return dbReady;
}

// Kick off DB connection immediately
ensureDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Ensure DB is connected before handling any request (serverless cold-start safety)
app.use(async (_req, _res, next) => {
  await ensureDB();
  next();
});

// Routes configuration matching REST API contract
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', profileRoutes); // mapped setting route (GET /settings, PUT /settings)
app.use('/api/experiences', experienceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/upload', uploadRoutes);

// Serve uploads folder statically (only works locally, not on Vercel serverless)
const UPLOADS_PATH = path.join(process.cwd(), '..', 'frontend', 'public', 'uploads');
if (fs.existsSync(UPLOADS_PATH)) {
  app.use('/uploads', express.static(UPLOADS_PATH));
} else {
  const LOCAL_UPLOADS = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(LOCAL_UPLOADS)) {
    try { fs.mkdirSync(LOCAL_UPLOADS, { recursive: true }); } catch {}
  }
  app.use('/uploads', express.static(LOCAL_UPLOADS));
}

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('Portfolio Headless CMS API is running...');
});

// Only listen in non-serverless environments (local dev)
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
