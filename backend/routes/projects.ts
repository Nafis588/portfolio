import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import { authMiddleware, AuthRequest } from '../utils/auth.js';
import { fallbackProjects } from '../utils/fallback.js';

const router = express.Router();

// Helper to seed projects if MongoDB is empty
export async function seedProjectsIfNeeded() {
  const isDbConnected = mongoose.connection.readyState === 1;
  try {
    if (isDbConnected) {
      const count = await Project.countDocuments({});
      if (count === 0) {
        const fallbackItems = fallbackProjects.getAll();
        // Remove local _id strings to let MongoDB auto-generate them
        const mongooseItems = fallbackItems.map(({ _id, ...rest }) => rest);
        await Project.insertMany(mongooseItems);
        console.log('Default MongoDB projects seeded.');
      }
    } else {
      fallbackProjects.getAll();
    }
  } catch (err) {
    console.error('Failed to seed default projects:', err);
  }
}

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let projects;
    if (isDbConnected) {
      projects = await Project.find({}).sort({ sortOrder: 1 });
    } else {
      projects = fallbackProjects.getAll().sort((a, b) => a.sortOrder - b.sortOrder);
    }
    res.json(projects);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let newProject;
    if (isDbConnected) {
      newProject = await Project.create(req.body);
    } else {
      newProject = fallbackProjects.create(req.body);
    }
    res.status(201).json({ success: true, message: 'Project created!', data: newProject });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let updatedProject;
    if (isDbConnected) {
      updatedProject = await Project.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedProject) {
        return res.status(404).json({ message: 'Project not found' });
      }
    } else {
      updatedProject = fallbackProjects.update(id, req.body);
      if (!updatedProject) {
        return res.status(404).json({ message: 'Project not found locally' });
      }
    }
    res.json({ success: true, message: 'Project updated!', data: updatedProject });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    if (isDbConnected) {
      const deleted = await Project.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Project not found' });
      }
    } else {
      const success = fallbackProjects.delete(id);
      if (!success) {
        return res.status(404).json({ message: 'Project not found locally' });
      }
    }
    res.json({ success: true, message: 'Project deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
