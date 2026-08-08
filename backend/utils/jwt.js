import jwt from 'jsonwebtoken';

const secret = process.env.JWT_SECRET || 'supersecretkey';

export function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '1d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
}
