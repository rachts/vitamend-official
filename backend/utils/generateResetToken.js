const crypto = require('crypto');

/**
 * Generates a random token and its hashed version.
 * @returns {Object} An object containing the plain token (to send via email) and the hashed token (to save in DB).
 */
const generateResetToken = () => {
  // Generate a secure 32-byte hex token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash the token using sha256 to store in the database securely
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  return { resetToken, hashedToken };
};

/**
 * Hashes an existing token for comparison.
 * @param {string} token - The plain text token.
 * @returns {string} The hashed token.
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateResetToken,
  hashToken
};
