/**
 * CONCEPT 5, 6 & 7 – Authentication Routes
 *
 * POST /auth/register  → create user (bcrypt hashes password via Mongoose hook)
 * POST /auth/login     → local strategy via Passport → returns JWT token
 * GET  /auth/logout    → destroy session, clear cookie
 * GET  /auth/profile   → JWT-protected route example
 * POST /auth/refresh   → demonstrate cookie-based session reading
 *
 * CONCEPT 5 (Sessions & Cookies):
 *   - express-session stores session data on server, sends cookie to client
 *   - Cookie = small piece of data stored in browser (sent with every request)
 *
 * CONCEPT 6 & 7 (JWT + Bcrypt + Passport):
 *   - Bcrypt: hash passwords before storing → compare on login
 *   - JWT: signed token issued after login → client sends it in header
 *   - Passport: strategy-based auth (local, google, github, etc.)
 */

const express  = require('express');
const jwt      = require('jsonwebtoken');
const bcrypt   = require('bcryptjs');
const passport = require('passport');
const router   = express.Router();

const User             = require('../models/User');
const { verifyJWT }    = require('../middleware/authMiddleware');

// Helper: generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'jwt_fallback_secret',
    { expiresIn: '7d' }           // Token expires in 7 days
  );
};

// ── GET /auth/login and /auth/register Form Views ───────────────────────────────
router.get('/login', (req, res) => {
  if (req.session.user || (req.isAuthenticated && req.isAuthenticated())) {
    return res.redirect('/chat/room');
  }
  res.render('login', { title: 'Login - Chat Analyzer' });
});

router.get('/register', (req, res) => {
  if (req.session.user || (req.isAuthenticated && req.isAuthenticated())) {
    return res.redirect('/chat/room');
  }
  res.render('register', { title: 'Register - Chat Analyzer' });
});

// ── POST /auth/register ───────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'username, email, and password are required'
      });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Create user — password is hashed automatically via the pre-save hook in User model
    const user = await User.create({ username, email, password });

    // Issue JWT immediately after registration
    const token = generateToken(user);

    // CONCEPT 5: Also start a session
    req.session.user = { id: user._id, username: user.username, role: user.role };

    req.session.save((err) => {
      if (err) return res.status(500).json({ success: false, message: 'Session save failed' });
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,                         // Concept 6 & 7: JWT
        user: {
          id:       user._id,
          username: user.username,
          email:    user.email,
          role:     user.role
        }
      });
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
router.post('/login', (req, res, next) => {
  // CONCEPT 6 & 7: Passport authenticates using LocalStrategy (bcrypt compare)
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: info.message || 'Authentication failed'
      });
    }

    // Log in via Passport (creates session - Concept 5)
    req.logIn(user, (err) => {
      if (err) return next(err);

      // Also issue JWT token (Concept 6 & 7)
      const token = generateToken(user);

      // CONCEPT 5: Store user info in session
      req.session.user = { id: user._id, username: user.username, role: user.role };

      req.session.save((err) => {
        if (err) return next(err);
        res.json({
          success:  true,
          message:  'Login successful',
          token,                       // Use this for JWT-protected routes
          sessionId: req.sessionID,    // Concept 5: session ID in cookie
          user: {
            id:       user._id,
            username: user.username,
            email:    user.email,
            role:     user.role
          }
        });
      });
    });
  })(req, res, next);
});

// ── GET /auth/logout ──────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  // CONCEPT 5: Destroy session on logout
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');   // Clear the session cookie
    req.logout(() => {
      res.redirect('/auth/login');    // Redirect to login page instead of sending JSON
    });             // Passport logout
  });
});

// ── GET /auth/profile (JWT protected) ────────────────────────────────────────
// CONCEPT 6 & 7: This route requires a valid JWT token in Authorization header
router.get('/profile', verifyJWT, (req, res) => {
  res.json({
    success: true,
    message: 'JWT verified — you have access',
    user: {
      id:       req.user._id,
      username: req.user.username,
      email:    req.user.email,
      role:     req.user.role
    }
  });
});

// ── GET /auth/session-info ────────────────────────────────────────────────────
// CONCEPT 5: Demonstrates reading session data
router.get('/session-info', (req, res) => {
  res.json({
    success:   true,
    sessionID: req.sessionID,
    session:   req.session.user || null,
    cookie: {
      maxAge:   req.session.cookie.maxAge,
      httpOnly: req.session.cookie.httpOnly,
      secure:   req.session.cookie.secure
    },
    isLoggedIn: req.isAuthenticated()
  });
});

module.exports = router;
