import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Profile from '../models/Profile.js';
import { authMiddleware, AuthRequest } from '../utils/auth.js';
import { fallbackProfile } from '../utils/fallback.js';

const router = express.Router();

// Helper to seed a default profile
export async function seedProfileIfNeeded() {
  const isDbConnected = mongoose.connection.readyState === 1;
  try {
    if (isDbConnected) {
      const count = await Profile.countDocuments({});
      if (count === 0) {
        await Profile.create({
          fullName: 'Md. Nafis Sadique Niloy',
          siteName: 'Nafis Niloy Portfolio',
          metaDescription: 'Md. Nafis Sadique Niloy - Certified Scrum Product Owner (CSPO) & Trainee Project Coordinator',
          heroGreeting: 'Hi, I am',
          heroTitles: [
            'Trainee Project Coordinator',
            'Computer Science Graduate',
            'Agile & Product Management Enthusiast'
          ],
          bioParagraphs: [
            'I bridge business needs with engineering execution, specializing in Agile project management methodologies, sprint planning, and Work Breakdown Structures (WBS).',
            'Currently operating out of Dhaka and Rangpur, my core focus is driving delivery efficiency across enterprise and government clients.'
          ],
          avatarUrl: '/profile.png',
          heroBadgeText: 'CSPO® Certified Product Owner',
          aboutStatusText: 'Currently active at ATI Limited — Full-Time',
          designTokens: {
            primaryColor: '#6366f1',
            secondaryColor: '#475569',
            fontFamily: 'Plus Jakarta Sans',
            backgroundColor: '#040814',
            textColor: '#f1f5f9',
            cardColor: 'rgba(15, 23, 42, 0.5)',
            themeTemplate: 'cyan-emerald'
          },
          socialLinks: {
            github: 'https://github.com/Nafis588',
            linkedin: 'https://www.linkedin.com/in/nafissn/',
            email: 'mdnafissadiqueniloy@gmail.com'
          },
          resumeUrl: '/CV of Md. Nafis Sadique Niloy.pdf',
          sectionVisibility: {
            showExperience: true,
            showStartups: true,
            showCertifications: true,
            showEducation: true,
            showSkills: true,
            showLeadership: true,
            showAchievements: true
          },
          stat1: { value: 7, suffix: '+', label: 'Projects Coordinated' },
          stat2: { value: 4, suffix: '+', label: 'Certs & Credentials' },
          stat3: { value: 500, suffix: '+', label: 'BUCC Members Led' },
          stat4: { value: 3, suffix: '+', label: 'Years in PM / Tech' },
          location: 'Dhaka & Rangpur, Bangladesh',
          clients: [
            { name: 'Bangladesh Navy', icon: '⚓' },
            { name: 'Jamuna Oil Company', icon: '🏭' },
            { name: 'Bangladesh Maritime University', icon: '🎓' },
            { name: 'ATI Limited', icon: '💼' },
            { name: 'Ghana Healthcare Client', icon: '🏥' }
          ]
        });
        console.log('Default MongoDB profile settings seeded.');
      }
    } else {
      fallbackProfile.get(); // Triggers default write in fallback if file doesn't exist
    }
  } catch (err) {
    console.error('Failed to seed default profile:', err);
  }
}

// @desc    Get profile details
// @route   GET /api/settings
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let profile;
    if (isDbConnected) {
      profile = await Profile.findOne({});
      if (!profile) {
        profile = await Profile.create({
          fullName: 'Md. Nafis Sadique Niloy',
          siteName: 'Nafis Niloy Portfolio',
          metaDescription: 'Md. Nafis Sadique Niloy - Certified Scrum Product Owner (CSPO) & Trainee Project Coordinator',
          heroGreeting: 'Hi, I am',
          heroTitles: [
            'Trainee Project Coordinator',
            'Computer Science Graduate',
            'Agile & Product Management Enthusiast'
          ],
          bioParagraphs: [
            'I bridge business needs with engineering execution, specializing in Agile project management methodologies, sprint planning, and Work Breakdown Structures (WBS).',
            'Currently operating out of Dhaka and Rangpur, my core focus is driving delivery efficiency across enterprise and government clients.'
          ],
          avatarUrl: '/profile.png',
          heroBadgeText: 'CSPO® Certified Product Owner',
          aboutStatusText: 'Currently active at ATI Limited — Full-Time',
          designTokens: {
            primaryColor: '#6366f1',
            secondaryColor: '#475569',
            fontFamily: 'Plus Jakarta Sans',
            backgroundColor: '#040814',
            textColor: '#f1f5f9',
            cardColor: 'rgba(15, 23, 42, 0.5)',
            themeTemplate: 'cyan-emerald'
          },
          socialLinks: {
            github: 'https://github.com/Nafis588',
            linkedin: 'https://www.linkedin.com/in/nafissn/',
            email: 'mdnafissadiqueniloy@gmail.com'
          },
          resumeUrl: '/CV of Md. Nafis Sadique Niloy.pdf',
          sectionVisibility: {
            showExperience: true,
            showStartups: true,
            showCertifications: true,
            showEducation: true,
            showSkills: true,
            showLeadership: true,
            showAchievements: true
          },
          stat1: { value: 7, suffix: '+', label: 'Projects Coordinated' },
          stat2: { value: 4, suffix: '+', label: 'Certs & Credentials' },
          stat3: { value: 500, suffix: '+', label: 'BUCC Members Led' },
          stat4: { value: 3, suffix: '+', label: 'Years in PM / Tech' },
          location: 'Dhaka & Rangpur, Bangladesh',
          clients: [
            { name: 'Bangladesh Navy', icon: '⚓' },
            { name: 'Jamuna Oil Company', icon: '🏭' },
            { name: 'Bangladesh Maritime University', icon: '🎓' },
            { name: 'ATI Limited', icon: '💼' },
            { name: 'Ghana Healthcare Client', icon: '🏥' }
          ]
        });
      }
    } else {
      profile = fallbackProfile.get();
    }
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// @desc    Update profile details
// @route   PUT /api/settings
// @access  Private
router.put('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let profile;
    if (isDbConnected) {
      profile = await Profile.findOne({});
      if (!profile) {
        profile = new Profile(req.body);
      } else {
        Object.assign(profile, req.body);
      }
      await profile.save();
    } else {
      const current = fallbackProfile.get();
      profile = { ...current, ...req.body };
      fallbackProfile.save(profile);
    }
    res.json({ success: true, message: 'Settings updated successfully!', data: profile });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
