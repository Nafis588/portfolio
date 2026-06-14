import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Skill from '../models/Skill.js';
import { authMiddleware, AuthRequest } from '../utils/auth.js';
import { fallbackSkills } from '../utils/fallback.js';

const router = express.Router();

// Helper to seed skills if MongoDB is empty
export async function seedSkillsIfNeeded() {
  const isDbConnected = mongoose.connection.readyState === 1;
  try {
    if (isDbConnected) {
      const count = await Skill.countDocuments({});
      if (count === 0) {
        const fallbackItems = fallbackSkills.getAll();
        const mongooseItems = fallbackItems.map(({ _id, ...rest }) => rest);
        await Skill.insertMany(mongooseItems);
        console.log('Default MongoDB skills seeded.');
      }
    } else {
      fallbackSkills.getAll();
    }
  } catch (err) {
    console.error('Failed to seed default skills:', err);
  }
}

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let skills;
    if (isDbConnected) {
      skills = await Skill.find({}).sort({ sortOrder: 1 });
    } else {
      skills = fallbackSkills.getAll().sort((a, b) => a.sortOrder - b.sortOrder);
    }
    res.json(skills);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Create a new skill
// @route   POST /api/skills
// @access  Private
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let newSkill;
    if (isDbConnected) {
      newSkill = await Skill.create(req.body);
    } else {
      newSkill = fallbackSkills.create(req.body);
    }
    res.status(201).json({ success: true, message: 'Skill created!', data: newSkill });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update a skill
// @route   PUT /api/skills/:id
// @access  Private
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let updatedSkill;
    if (isDbConnected) {
      updatedSkill = await Skill.findByIdAndUpdate(id, req.body, { new: true });
      if (!updatedSkill) {
        return res.status(404).json({ message: 'Skill not found' });
      }
    } else {
      updatedSkill = fallbackSkills.update(id, req.body);
      if (!updatedSkill) {
        return res.status(404).json({ message: 'Skill not found locally' });
      }
    }
    res.json({ success: true, message: 'Skill updated!', data: updatedSkill });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Delete a skill
// @route   DELETE /api/skills/:id
// @access  Private
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    if (isDbConnected) {
      const deleted = await Skill.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Skill not found' });
      }
    } else {
      const success = fallbackSkills.delete(id);
      if (!success) {
        return res.status(404).json({ message: 'Skill not found locally' });
      }
    }
    res.json({ success: true, message: 'Skill deleted successfully!' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
