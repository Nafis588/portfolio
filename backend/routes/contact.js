import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Message from '../models/Message.js';

const router = express.Router();
const localFilePath = path.join(process.cwd(), 'messages.json');

// Helper to save locally
const saveLocally = (messageData) => {
  try {
    let messages = [];
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
// @access  Public
router.post('/', async (req, res) => {
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

    res.status(201).json({
      success: true,
      message: isDbConnected ? 'Message sent successfully (Saved to MongoDB)!' : 'Message sent successfully (Saved to local backup file)!',
      data: savedMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all messages (for testing/admin purposes)
// @route   GET /api/contact
// @access  Public
router.get('/', async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (isDbConnected) {
      const messages = await Message.find({}).sort({ createdAt: -1 });
      res.json(messages);
    } else {
      res.json(getLocally().reverse());
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
