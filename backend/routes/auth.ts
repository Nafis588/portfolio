import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { verifyPassword, createToken, hashPassword } from '../utils/auth.js';
import { fallbackUsers } from '../utils/fallback.js';

const router = express.Router();

// Helper to seed a default admin if no users exist
export async function seedAdminIfNeeded() {
  const defaultEmail = 'admin@nafis.info';
  const defaultPassword = 'adminpassword123'; // The admin can update it later
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    if (isDbConnected) {
      const count = await User.countDocuments({});
      if (count === 0) {
        const hashedPassword = hashPassword(defaultPassword);
        await User.create({ email: defaultEmail, password: hashedPassword });
        console.log(`Default admin user seeded: ${defaultEmail}`);
      }
    } else {
      const users = fallbackUsers.getAll();
      if (users.length === 0) {
        const hashedPassword = hashPassword(defaultPassword);
        users.push({ _id: 'admin', email: defaultEmail, password: hashedPassword });
        fallbackUsers.save(users);
        console.log(`Default local fallback admin user seeded: ${defaultEmail}`);
      }
    }
  } catch (err) {
    console.error('Failed to seed default admin:', err);
  }
}

// @desc    Authenticate admin user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let user;
    if (isDbConnected) {
      user = await User.findOne({ email });
    } else {
      const users = fallbackUsers.getAll();
      user = users.find(u => u.email === email);
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = createToken({ id: user._id?.toString() || user.id, email: user.email });

    res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        email: user.email
      }
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
