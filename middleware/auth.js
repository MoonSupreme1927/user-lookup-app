// middleware/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(400).json({ error: 'Invalid token' });
  }
}

// Middleware to require user role
function requireUser(req, res, next) {
  if (req.user.role !== 'user') {
    return res.status(403).json({ error: 'Users only' });
  }
  next();
}

// Middleware to require admin role
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }
  next();
}

// Middleware to require owner access (by ID)
function requireOwner(req, res, next) {
  if (req.user._id !== req.params.id) {
    return res.status(403).json({ error: 'Owners only' });
  }
  next();
}

// Export all middlewares
module.exports = {
  verifyToken,
  requireUser,
  requireAdmin,
  requireOwner
};
