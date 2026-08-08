import QRCode from 'qrcode';

/**
 * Generate a QR code Data URL (SVG) for the provided text.
 * @param {string} text - The content to encode in the QR code.
 * @returns {Promise<string>} - Data URL containing the SVG image.
 */
export const generateQR = async (text) => {
  try {
    const dataUrl = await QRCode.toDataURL(text, { type: 'image/svg+xml' });
    return dataUrl;
  } catch (err) {
    console.error('QR generation error:', err);
    throw err;
  }
};
