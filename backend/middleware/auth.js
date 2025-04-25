const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify JWT token and attach user to request
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
}

// Protect routes for any logged-in user
function requireUser(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// Admin-only access
function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admins only' });
  }
  next();
}

// User can access only their own data (or admin override)
function requireOwner(req, res, next) {
  const targetId = req.params.userId || req.params.id;
  if (req.user._id !== targetId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Not your account.' });
  }
  next();
}

module.exports = {
  verifyToken,
  requireUser,
  requireAdmin,
  requireOwner,
};
