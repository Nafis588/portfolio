import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import { verifyPassword, createToken, hashPassword, authMiddleware, AuthRequest } from '../utils/auth.js';
import { fallbackUsers, fallbackProfile } from '../utils/fallback.js';
import { sendEmail } from '../utils/email.js';

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

// Rate limiting map for forgot-password requests
interface RateLimitInfo {
  count: number;
  resetTime: number;
}
const forgotPasswordLimits = new Map<string, RateLimitInfo>();

function checkForgotRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = forgotPasswordLimits.get(ip);
  if (!limit) {
    forgotPasswordLimits.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return true;
  }
  if (now > limit.resetTime) {
    forgotPasswordLimits.set(ip, { count: 1, resetTime: now + 15 * 60 * 1000 });
    return true;
  }
  if (limit.count >= 3) {
    return false;
  }
  limit.count += 1;
  return true;
}

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Please provide an email address' });
  }

  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown-ip';

  // Clean up limits map occasionally
  if (forgotPasswordLimits.size > 100) {
    const now = Date.now();
    for (const [key, val] of forgotPasswordLimits.entries()) {
      if (now > val.resetTime) {
        forgotPasswordLimits.delete(key);
      }
    }
  }

  if (!checkForgotRateLimit(ip)) {
    return res.status(429).json({ message: 'Too many requests. Please try again after 15 minutes.' });
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

    // Safe response: do not reveal whether email exists
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, we have sent a password reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    if (isDbConnected) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires
          }
        }
      );
    } else {
      const users = fallbackUsers.getAll();
      const idx = users.findIndex(u => u.email === email);
      if (idx !== -1) {
        users[idx].resetPasswordToken = resetToken;
        users[idx].resetPasswordExpires = resetExpires;
        fallbackUsers.save(users);
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://nafissn.vercel.app';
    const resetUrl = `${frontendUrl}/admin?resetToken=${resetToken}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333333; text-align: center;">CMS Password Reset Request</h2>
        <p>Hello,</p>
        <p>You are receiving this email because a password reset request was made for your CMS administrator account.</p>
        <p style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </p>
        <p>If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        <p>This link will expire in 1 hour.</p>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777777; text-align: center;">Nafis Portfolio CMS</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: 'CMS Password Reset Link',
      html: emailHtml
    });

    return res.json({ success: true, message: 'If that email exists, we have sent a password reset link.' });
  } catch (err: any) {
    console.error('Forgot password endpoint error:', err);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let user;
    if (isDbConnected) {
      user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: new Date() }
      });
    } else {
      const users = fallbackUsers.getAll();
      user = users.find(u => {
        if (!u.resetPasswordToken || !u.resetPasswordExpires) return false;
        const expires = new Date(u.resetPasswordExpires);
        return u.resetPasswordToken === token && expires > new Date();
      });
    }

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    const hashedPassword = hashPassword(password);

    if (isDbConnected) {
      await User.updateOne(
        { _id: user._id },
        {
          $set: { password: hashedPassword },
          $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 }
        }
      );
    } else {
      const users = fallbackUsers.getAll();
      const idx = users.findIndex(u => u._id === user._id || u.id === user.id);
      if (idx !== -1) {
        users[idx].password = hashedPassword;
        delete users[idx].resetPasswordToken;
        delete users[idx].resetPasswordExpires;
        fallbackUsers.save(users);
      }
    }

    return res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (err: any) {
    console.error('Reset password endpoint error:', err);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// @desc    Change password (for logged in admin)
// @route   POST /api/auth/change-password
// @access  Private
router.post('/change-password', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required' });
  }

  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let user;
    if (isDbConnected) {
      user = await User.findById(req.user?.id);
    } else {
      const users = fallbackUsers.getAll();
      user = users.find(u => u._id === req.user?.id || u.id === req.user?.id);
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid current password' });
    }

    const hashedPassword = hashPassword(newPassword);

    if (isDbConnected) {
      await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
    } else {
      const users = fallbackUsers.getAll();
      const idx = users.findIndex(u => u._id === user._id || u.id === user.id);
      if (idx !== -1) {
        users[idx].password = hashedPassword;
        fallbackUsers.save(users);
      }
    }

    return res.json({ success: true, message: 'Password updated successfully!' });
  } catch (err: any) {
    console.error('Change password endpoint error:', err);
    return res.status(500).json({ message: 'An internal server error occurred.' });
  }
});

// @desc    Get SMTP configuration status (safe, no secret values leaked)
// @route   GET /api/auth/smtp-status
// @access  Private
router.get('/smtp-status', authMiddleware, async (req: AuthRequest, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  let dbProfile: any;
  try {
    if (isDbConnected) {
      dbProfile = await Profile.findOne({});
    } else {
      dbProfile = fallbackProfile.get();
    }
  } catch (err) {}

  res.json({
    smtpHost: dbProfile?.smtpHost || process.env.EMAIL_HOST || '',
    smtpPort: dbProfile?.smtpPort || process.env.EMAIL_PORT || 587,
    smtpUser: dbProfile?.smtpUser || process.env.EMAIL_USER || '',
    smtpPass: (dbProfile?.smtpPass || process.env.EMAIL_PASS) ? '••••••••' : '',
    smtpFrom: dbProfile?.smtpFrom || process.env.EMAIL_FROM || '',
    smtpTo: dbProfile?.smtpTo || process.env.EMAIL_TO || 'mdnafissadiqueniloy@gmail.com',
    EMAIL_HOST_ENV: !!process.env.EMAIL_HOST,
    EMAIL_PORT_ENV: !!process.env.EMAIL_PORT,
    EMAIL_USER_ENV: !!process.env.EMAIL_USER,
    EMAIL_PASS_ENV: !!process.env.EMAIL_PASS,
  });
});

// @desc    Update SMTP configuration settings in database
// @route   POST /api/auth/smtp-config
// @access  Private
router.post('/smtp-config', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom, smtpTo } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    let profile: any;
    if (isDbConnected) {
      profile = await Profile.findOne({});
    } else {
      profile = fallbackProfile.get();
    }

    if (!profile) {
      return res.status(404).json({ message: 'Profile settings not found' });
    }

    profile.smtpHost = smtpHost || '';
    profile.smtpPort = smtpPort ? parseInt(smtpPort, 10) : 587;
    profile.smtpUser = smtpUser || '';
    if (smtpPass && smtpPass !== '••••••••') {
      profile.smtpPass = smtpPass;
    }
    profile.smtpFrom = smtpFrom || '';
    profile.smtpTo = smtpTo || 'mdnafissadiqueniloy@gmail.com';

    if (isDbConnected) {
      await profile.save();
    } else {
      fallbackProfile.save(profile);
    }

    return res.json({ success: true, message: 'SMTP settings updated successfully!' });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

// @desc    Send test SMTP email
// @route   POST /api/auth/test-email
// @access  Private
router.post('/test-email', authMiddleware, async (req: AuthRequest, res: Response) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  let dbProfile: any;
  try {
    if (isDbConnected) {
      dbProfile = await Profile.findOne({});
    } else {
      dbProfile = fallbackProfile.get();
    }
  } catch (err) {}

  const targetEmail = dbProfile?.smtpTo || 'mdnafissadiqueniloy@gmail.com';

  try {
    const success = await sendEmail({
      to: targetEmail,
      subject: 'Nafis Portfolio CMS: SMTP Test Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <h2 style="color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px;">SMTP Connection Test Successful</h2>
          <p>Hello Md. Nafis Sadique Niloy,</p>
          <p>This is a test email sent from your Portfolio CMS Control Dashboard to verify your SMTP settings.</p>
          <p>Your SMTP credentials are configured and functioning correctly!</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777777;">Nafis Portfolio CMS</p>
        </div>
      `
    });

    if (success) {
      return res.json({ success: true, message: `Test email sent successfully to ${targetEmail}!` });
    } else {
      return res.status(500).json({ message: 'SMTP sending failed. Please check SMTP configuration details in the CMS board.' });
    }
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
});

export default router;
