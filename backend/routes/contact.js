import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage,
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
    const messages = await Message.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
