const crypto = require('crypto');

/**
 * Generates a random alphanumeric reward code of specified length.
 * @param {number} length - Length of the reward code
 * @returns {string} - The generated reward code
 */
const generateRewardCode = (length = 8) => {
  return crypto.randomBytes(length)
    .toString('base64')      // Converts to Base64 string
    .replace(/[^a-zA-Z0-9]/g, '') // Remove special characters
    .slice(0, length)         // Trim to desired length
    .toUpperCase();           // Uppercase for readability
};

module.exports = generateRewardCode;