import crypto from 'crypto';

export const generateShortCode = () => {
  // Generate a 6-character random hex string and convert to uppercase for readability
  return crypto.randomBytes(3).toString('hex').toUpperCase();
};
