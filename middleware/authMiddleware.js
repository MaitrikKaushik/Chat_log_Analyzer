/**
 * CONCEPT 5, 6 & 7 – Authentication Middleware
 *
 * These are Router-level middleware functions used to protect routes.
 *
 * 1. isAuthenticated    → checks if user has a valid SESSION (Concept 5)
 * 2. verifyJWT          → checks if user sent a valid JWT token (Concept 6 & 7)
 * 3. isAdmin            → checks user role (authorization, not authentication)
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── 1. Session-based Auth Guard ───────────────────────────────────────────────
// Concept 5: Express-Session stores user info in server-side session
const isAuthenticated = (req, res, next) => {
  // passport.js sets req.isAuthenticated() after session deserialization
  if (req.isAuthenticated()) {
    return next();    // user is logged in → proceed
  }

  // No session → send 401
  res.status(401).json({
    success: false,
    message: 'Please log in to access this resource',
    loginUrl: '/auth/login'
  });
};

// ── 2. JWT-based Auth Guard ───────────────────────────────────────────────────
// Concept 6 & 7: Stateless auth using signed JWT token
const verifyJWT = async (req, res, next) => {
  try {
    // JWT is sent in the Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Send: Authorization: Bearer <token>'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_fallback_secret');

    // Attach user to request
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();   // token valid → proceed
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ── 3. Role-based Authorization Guard ────────────────────────────────────────
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({
    success: false,
    message: 'Access denied. Admin role required.'
  });
};

module.exports = { isAuthenticated, verifyJWT, isAdmin };
