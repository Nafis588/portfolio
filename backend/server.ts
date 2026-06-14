import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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

// Connect to Database
connectDB().then(async () => {
  // Seed initial admin, profile/settings, projects, experiences, startups, skills
  await seedAdminIfNeeded();
  await seedProfileIfNeeded();
  await seedProjectsIfNeeded();
  await seedExperiencesIfNeeded();
  await seedStartupsIfNeeded();
  await seedSkillsIfNeeded();
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes configuration matching REST API contract
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/settings', profileRoutes); // mapped setting route (GET /settings, PUT /settings)
app.use('/api/experiences', experienceRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/startups', startupRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/upload', uploadRoutes);

// Root Endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('Portfolio Headless CMS API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
