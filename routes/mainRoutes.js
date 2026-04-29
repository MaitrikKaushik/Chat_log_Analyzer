/**
 * CONCEPT 1 – Router-Level Middleware + All Original CRUD Routes
 *
 * Router-level middleware works the same as application-level middleware
 * but is bound to a specific express.Router() instance.
 * It only runs for routes defined in this router.
 */

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');

const { readFile, writeFile, streamFile } = require('../controllers/dataController');
const { analyzeChat }                     = require('../controllers/analyzeController');
const { isAuthenticated, verifyJWT }      = require('../middleware/authMiddleware');

// CONCEPT 1 – Router-level middleware (runs for ALL /api/* routes)
const apiLogger = (req, res, next) => {
  console.log(`🔵 [API Middleware] ${req.method} /api${req.path} @ ${new Date().toISOString()}`);
  next();    // Must call next() or request hangs
};

router.use(apiLogger);  // Apply to all routes in this router

// Configure Multer (in memory) for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// ── GET /api/ ─────────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  res.json({
    message: 'API Home — All 8 Concepts',
    routes: {
      crud:      { user: '/api/user/:id', search: '/api/search?name=', update: 'PUT /api/update/:id', delete: 'DELETE /api/delete/:id' },
      files:     { analyze: 'POST /api/analyze', read: 'GET /api/read', write: 'POST /api/write', stream: 'GET /api/stream' },
      auth:      { register: 'POST /auth/register', login: 'POST /auth/login', profile: 'GET /auth/profile (JWT)' },
      session:   { info: 'GET /auth/session-info', logout: 'GET /auth/logout' },
      realtime:  { room: 'GET /chat/room', info: 'GET /chat/info' },
      protected: { dashboard: 'GET /api/dashboard (session auth)', admin: 'GET /api/admin (JWT+role)' }
    }
  });
});

// ── GET /api/about ────────────────────────────────────────────────────────────
router.get('/about', (req, res) => {
  res.json({
    page: 'About',
    description: 'Node.js Express Backend — 8 Concepts Implemented',
    concepts: [
      'Middleware (lifecycle, app, router, error-handling, third-party, body-parser)',
      'SSR vs CSR + Template Engines (EJS)',
      'Databases: SQL vs NoSQL, MongoDB connection',
      'ODM-Mongoose: Schema, Model, CRUD',
      'Session Management + Cookies (express-session)',
      'Authentication: Bcrypt + JWT + Passport JS',
      'Advanced Auth: JWT token works, Passport strategies',
      'Full Duplex Communication: Socket.io'
    ]
  });
});

// ── GET /api/user/:id ─────────────────────────────────────────────────────────
router.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.json({ message: 'User Details', userId, name: `User ${userId}`, email: `user${userId}@example.com` });
});

// ── GET /api/search?name= ─────────────────────────────────────────────────────
router.get('/search', (req, res) => {
  const searchQuery = req.query.name;
  if (!searchQuery) {
    return res.status(400).json({ error: 'Query parameter "name" is required', example: '/api/search?name=john' });
  }
  res.json({
    message: 'Search Results', query: searchQuery,
    results: [{ id: 1, name: searchQuery + ' 1' }, { id: 2, name: searchQuery + ' 2' }]
  });
});

// ── POST /api/data ────────────────────────────────────────────────────────────
router.post('/data', (req, res) => {
  const { name, email, age } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }
  res.status(201).json({ message: 'Data received', data: { name, email, age: age || 'Not provided', createdAt: new Date() } });
});

// ── PUT /api/update/:id ───────────────────────────────────────────────────────
router.put('/update/:id', (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: '"name" field is required' });
  res.json({ message: 'Item updated', id: req.params.id, updated: { name, description, updatedAt: new Date() } });
});

// ── DELETE /api/delete/:id ────────────────────────────────────────────────────
router.delete('/delete/:id', (req, res) => {
  res.json({ message: 'Item deleted', deletedId: req.params.id, timestamp: new Date() });
});

// ── File Routes ───────────────────────────────────────────────────────────────
router.post('/analyze', upload.single('file'), analyzeChat);
router.get('/read',   readFile);
router.post('/write', writeFile);
router.get('/stream', streamFile);

// ── CONCEPT 5: Session-protected dashboard ────────────────────────────────────
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to your dashboard!',
    concept: 'Concept 5 — Session Auth',
    user: req.user || req.session.user,
    sessionID: req.sessionID
  });
});

// ── CONCEPT 6 & 7: JWT-protected admin route ──────────────────────────────────
router.get('/admin', verifyJWT, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin only' });
  }
  res.json({
    success: true,
    message: 'Admin panel — JWT verified',
    concept: 'Concept 6 & 7 — JWT + Passport',
    user: req.user
  });
});

// ── CONCEPT 3 & 4: MongoDB status endpoint ───────────────────────────────────
const mongoose = require('mongoose');
router.get('/db-status', (req, res) => {
  const states = { 0: 'Disconnected', 1: 'Connected', 2: 'Connecting', 3: 'Disconnecting' };
  res.json({
    success: true,
    concept: 'Concept 3 & 4 — MongoDB + Mongoose',
    dbState: states[mongoose.connection.readyState],
    dbName:  mongoose.connection.name || 'N/A',
    host:    mongoose.connection.host || 'N/A'
  });
});

module.exports = router;
