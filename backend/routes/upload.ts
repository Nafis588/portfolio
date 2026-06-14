import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authMiddleware } from '../utils/auth.js';

const router = express.Router();

// Upload path target inside the frontend public asset directory
let UPLOAD_DIR = path.join(process.cwd(), '..', 'frontend', 'public', 'uploads');

// Fallback to local directory if parent frontend does not exist
if (!fs.existsSync(path.join(process.cwd(), '..', 'frontend'))) {
  UPLOAD_DIR = path.join(process.cwd(), 'uploads');
}

if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create upload directory:', err);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp|svg|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/pdf';
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Images and PDFs only (jpeg, jpg, png, gif, webp, svg, pdf)!'));
    }
  }
});

// @desc    Upload image file
// @route   POST /api/upload
// @access  Private
router.post('/', authMiddleware, (req: Request, res: Response) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      success: true,
      message: 'Image uploaded successfully!',
      url: fileUrl
    });
  });
});

export default router;
