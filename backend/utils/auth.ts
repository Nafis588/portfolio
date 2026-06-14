import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';

// Define typed custom request interface for authenticated endpoints
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

const SESSION_SECRET = process.env.JWT_SECRET || 'antigravity-portfolio-jwt-secret-key-fallback';

// Hash password with bcryptjs
export function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

// Verify password with bcryptjs
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    return bcrypt.compareSync(password, storedHash);
  } catch (err) {
    return false;
  }
}

// Generate custom JWT
export function createToken(payload: { id: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

// Verify custom JWT
export function verifyToken(token: string): { id: string; email: string } | null {
  try {
    if (!token) return null;
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const checkSig = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== checkSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (err) {
    return null;
  }
}

// Middleware to protect routes
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Token is not valid or has expired' });
  }

  req.user = decoded;
  next();
}
