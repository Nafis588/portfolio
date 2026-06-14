import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Startup from '../models/Startup.js';
import { authMiddleware, AuthRequest } from '../utils/auth.js';
import { fallbackStartups } from '../utils/fallback.js';

const router = express.Router();

// Helper to seed startups if MongoDB is empty
export async function seedStartupsIfNeeded() {
  const isDbConnected = mongoose.connection.readyState === 1;
  try {
    if (isDbConnected) {
      const count = await Startup.countDocuments({});
      if (count === 0) {
        const fallbackItems = fallbackStartups.getAll();
        const mongooseItems = fallbackItems.map(({ _id, ...rest }) => rest);
        await Startup.insertMany(mongooseItems);
        console.log('Default MongoDB startups seeded.');
      }
    } else {
      fallbackStartups.getAll();
    }
  } catch (err) {
    console.error('Failed to seed default startups:', err);
  }
}

// @desc    Get all startups
// @route   GET /api/startups
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let startups;
    if (isDbConnected) {
      startups = await Startup.find({});
    } else {
      startups = fallbackStartups.getAll();
    }
    res.json(startups);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a new startup
// @route   POST /api/startups
// @access  Private
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let newStartup;
    if (isDbConnected) {
      newStartup = await Startup.create(req.body);
    } else {
      newStartup = fallbackStartups.create(req.body);
    }
    res.status(201).json({ success: true, message: 'Startup created!', data: newStartup });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update a startup
// @route   PUT /api/startups/:id
// @access  Private
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let updatedStartup;
    if (isDbConnected) {
      updatedStartup = await Startup.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedStartup) {
        return res.status(404).json({ message: 'Startup not found' });
      }
    } else {
      updatedStartup = fallbackStartups.update(id, req.body);
      if (!updatedStartup) {
        return res.status(404).json({ message: 'Startup not found locally' });
      }
    }
    res.json({ success: true, message: 'Startup updated!', data: updatedStartup });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Delete a startup
// @route   DELETE /api/startups/:id
// @access  Private
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    if (isDbConnected) {
      const deleted = await Startup.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Startup not found' });
      }
    } else {
      const success = fallbackStartups.delete(id);
      if (!success) {
        return res.status(404).json({ message: 'Startup not found locally' });
      }
    }
    res.json({ success: true, message: 'Startup deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
