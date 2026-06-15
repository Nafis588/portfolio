import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { put } from '@vercel/blob';
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

// Common configuration for Multer
const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB limit
const fileFilter = (req: any, file: any, cb: any) => {
  const filetypes = /jpeg|jpg|png|gif|webp|svg|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype) || file.mimetype === 'application/pdf';
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Images and PDFs only (jpeg, jpg, png, gif, webp, svg, pdf)!') as any);
  }
};

// 1. Local disk storage setup
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadLocal = multer({
  storage: localStorage,
  limits,
  fileFilter
});

// 2. Memory storage setup for Vercel Blob
const memoryStorage = multer.memoryStorage();
const uploadMemory = multer({
  storage: memoryStorage,
  limits,
  fileFilter
});

router.post('/', authMiddleware, (req: Request, res: Response) => {
  const isVercelBlobEnabled = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (process.env.VERCEL === '1' && !isVercelBlobEnabled) {
    return res.status(400).json({
      message: 'Vercel Blob Storage is not configured. Please enable it on Vercel or reconnect your database.'
    });
  }

  if (isVercelBlobEnabled) {
    // Process via Memory Storage and upload to Vercel Blob
    uploadMemory.single('image')(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = `${req.file.fieldname}-${uniqueSuffix}${path.extname(req.file.originalname)}`;
        
        // Upload directly to Vercel Blob Storage
        const blob = await put(filename, req.file.buffer, {
          access: 'public',
          contentType: req.file.mimetype
        });

        res.json({
          success: true,
          message: 'Image uploaded successfully to Vercel Blob!',
          url: blob.url
        });
      } catch (uploadErr: any) {
        console.error('Vercel Blob upload failed:', uploadErr);
        res.status(500).json({ message: `Vercel Blob upload failed: ${uploadErr.message}` });
      }
    });
  } else {
    // Process via Disk Storage (Local Dev Fallback)
    uploadLocal.single('image')(req, res, (err: any) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      res.json({
        success: true,
        message: 'Image uploaded successfully to local storage!',
        url: fileUrl
      });
    });
  }
});

export default router;
