import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Experience from '../models/Experience.js';
import { authMiddleware, AuthRequest } from '../utils/auth.js';
import { fallbackExperiences } from '../utils/fallback.js';

const router = express.Router();

// Helper to seed experiences if MongoDB is empty
export async function seedExperiencesIfNeeded() {
  const isDbConnected = mongoose.connection.readyState === 1;
  try {
    if (isDbConnected) {
      const count = await Experience.countDocuments({});
      if (count === 0) {
        const fallbackItems = fallbackExperiences.getAll();
        // Remove local _id strings to let MongoDB auto-generate them
        const mongooseItems = fallbackItems.map(({ _id, ...rest }) => rest);
        await Experience.insertMany(mongooseItems);
        console.log('Default MongoDB experiences seeded.');
      }
    } else {
      fallbackExperiences.getAll();
    }
  } catch (err) {
    console.error('Failed to seed default experiences:', err);
  }
}

// @desc    Get all experiences
// @route   GET /api/experiences
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let experiences;
    if (isDbConnected) {
      experiences = await Experience.find({}).sort({ sortOrder: 1 });
    } else {
      experiences = fallbackExperiences.getAll().sort((a, b) => a.sortOrder - b.sortOrder);
    }
    res.json(experiences);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a new experience
// @route   POST /api/experiences
// @access  Private
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let newExp;
    if (isDbConnected) {
      newExp = await Experience.create(req.body);
    } else {
      newExp = fallbackExperiences.create(req.body);
    }
    res.status(201).json({ success: true, message: 'Experience created!', data: newExp });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update an experience
// @route   PUT /api/experiences/:id
// @access  Private
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let updatedExp;
    if (isDbConnected) {
      updatedExp = await Experience.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedExp) {
        return res.status(404).json({ message: 'Experience not found' });
      }
    } else {
      updatedExp = fallbackExperiences.update(id, req.body);
      if (!updatedExp) {
        return res.status(404).json({ message: 'Experience not found locally' });
      }
    }
    res.json({ success: true, message: 'Experience updated!', data: updatedExp });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Delete an experience
// @route   DELETE /api/experiences/:id
// @access  Private
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    if (isDbConnected) {
      const deleted = await Experience.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Experience not found' });
      }
    } else {
      const success = fallbackExperiences.delete(id);
      if (!success) {
        return res.status(404).json({ message: 'Experience not found locally' });
      }
    }
    res.json({ success: true, message: 'Experience deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
