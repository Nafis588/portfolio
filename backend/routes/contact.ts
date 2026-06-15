import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Message from '../models/Message.js';
import { authMiddleware, AuthRequest } from '../utils/auth.js';
import { sendEmail } from '../utils/email.js';

const router = express.Router();
const localFilePath = path.join(process.cwd(), 'messages.json');

// Simple IP-based in-memory rate limiter
const ipCache = new Map<string, { count: number; resetTime: number }>();

const contactRateLimiter = (req: Request, res: Response, next: any) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes

  let ipData = ipCache.get(ip);

  if (!ipData || now > ipData.resetTime) {
    ipData = { count: 1, resetTime: now + windowMs };
    ipCache.set(ip, ipData);
    return next();
  }

  if (ipData.count >= 5) {
    return res.status(429).json({
      message: 'Too many contact submissions. Maximum is 5 requests per 15 minutes. Please try again later.'
    });
  }

  ipData.count++;
  next();
};

// Helper to save locally
const saveLocally = (messageData: any) => {
  try {
    let messages: any[] = [];
    if (fs.existsSync(localFilePath)) {
      const content = fs.readFileSync(localFilePath, 'utf8');
      messages = JSON.parse(content || '[]');
    }
    const newMessage = {
      _id: new mongoose.Types.ObjectId(),
      ...messageData,
      createdAt: new Date().toISOString()
    };
    messages.push(newMessage);
    fs.writeFileSync(localFilePath, JSON.stringify(messages, null, 2), 'utf8');
    return newMessage;
  } catch (err) {
    console.error('Failed to save message locally:', err);
    return { ...messageData, createdAt: new Date().toISOString() };
  }
};

// Helper to get local messages
const getLocally = () => {
  try {
    if (fs.existsSync(localFilePath)) {
      const content = fs.readFileSync(localFilePath, 'utf8');
      return JSON.parse(content || '[]');
    }
  } catch (err) {
    console.error('Failed to read local messages:', err);
  }
  return [];
};

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public (Rate-limited)
router.post('/', contactRateLimiter, async (req: Request, res: Response) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    let savedMessage;

    if (isDbConnected) {
      savedMessage = await Message.create({
        name,
        email,
        subject,
        message,
      });
    } else {
      console.log('MongoDB not connected. Saving message to local file fallback...');
      savedMessage = saveLocally({ name, email, subject, message });
    }

    // Send email notification to admin asynchronously (don't block the HTTP response)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #333333; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin-top: 15px; border-left: 4px solid #3b82f6;">
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777777;">Submitted from Nafis Portfolio Website</p>
      </div>
    `;

    sendEmail({
      subject: `New Portfolio Message: ${subject}`,
      html: emailHtml,
      fromName: name,
      fromEmail: email,
      rawMessage: message
    }).catch(err => console.error('Error in sendEmail trigger:', err));

    res.status(201).json({
      success: true,
      message: isDbConnected ? 'Message sent successfully (Saved to MongoDB)!' : 'Message sent successfully (Saved to local backup file)!',
      data: savedMessage,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all messages (for admin purposes)
// @route   GET /api/contact/messages
// @access  Private
router.get('/messages', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const messages = await Message.find({}).sort({ createdAt: -1 });
      res.json(messages);
    } else {
      res.json(getLocally().reverse());
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
