import express from 'express';
import { generateToken, verifyToken } from '../utils/jwt.js';


const router = express.Router();

// Simple admin login (username: admin, password: admin)
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin') {
    const token = generateToken({ admin: true, username });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

// Middleware to protect admin routes
router.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }
  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload?.admin) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  req.admin = payload;
  next();
});

export default router;
