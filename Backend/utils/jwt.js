// utils/jwt.js
const jwt = require('jsonwebtoken');

/**
 * Generate JWT Token
 * Payload contains:
 * - user id
 * - user role (admin / user)
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role || 'user', // default role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );
};

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
