/**
 * Node.js Express Backend Project
 * ALL 8 CONCEPTS IMPLEMENTED:
 *
 * Concept 1: Middleware (lifecycle, app-level, router-level, error-handling, third-party, body-parser)
 * Concept 2: SSR vs CSR + Template Engines (EJS)
 * Concept 3: Databases, SQL vs NoSQL, Connecting MongoDB, ODM-Mongoose
 * Concept 4: (Same as 3 in your notes - advanced Mongoose)
 * Concept 5: Session Management, Cookies, Express-Sessions
 * Concept 6: Authentication with Bcrypt, JWT, Passport JS
 * Concept 7: Authentication (same as 6 - advanced JWT + Passport)
 * Concept 8: Full Duplex Communication - Socket.io
 */

require('dotenv').config();

const express    = require('express');
const path       = require('path');
const http       = require('http');
const session    = require('express-session');
const passport   = require('passport');
const { Server } = require('socket.io');

// ─── DB Connection ────────────────────────────────────────────────────────────
const connectDB = require('./config/database');
connectDB();

// ─── Passport Config ──────────────────────────────────────────────────────────
require('./config/passport')(passport);

// ─── Routes ───────────────────────────────────────────────────────────────────
const mainRoutes  = require('./routes/mainRoutes');
const authRoutes  = require('./routes/authRoutes');
const chatRoutes  = require('./routes/chatRoutes');

// ─── Middleware ───────────────────────────────────────────────────────────────
const loggerMiddleware  = require('./middleware/loggerMiddleware');
const { errorHandler, notFoundHandler } = require('./utils/errorHandler');

// ─── App Setup ────────────────────────────────────────────────────────────────
const app    = express();
const server = http.createServer(app);           // Needed for Socket.io
const io     = new Server(server);               // Concept 8: Socket.io

// ─── CONCEPT 2: Template Engine (EJS = SSR) ───────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── CONCEPT 1: Middleware Stack ──────────────────────────────────────────────

// Custom app-level logger will be added after session

// Body parser (concept 1 - body parser)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (CSR assets)
app.use(express.static(path.join(__dirname, 'public')));

const MongoStore = require('connect-mongo');

// CONCEPT 5: Session + Cookie middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-analyzer',
    collectionName: 'sessions'
  }),
  cookie: {
    secure: false,          // set true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60  // 1 hour
  }
}));

// CONCEPT 6 & 7: Passport middleware (JWT + Local strategy)
app.use(passport.initialize());
app.use(passport.session());

// Custom app-level logger (moved after session so it can read req.sessionID)
app.use(loggerMiddleware);

// ─── CONCEPT 2: SSR Route (renders EJS template on server) ───────────────────
app.get('/', (req, res) => {
  // SSR: server generates full HTML before sending
  res.render('index', {
    title:   'Chat Log Analyzer',
    message: 'Welcome to Node.js Express Backend',
    status:  'Server is running ✅',
    user:    req.session.user || null,
    routes: {
      api:       '/api',
      login:     '/auth/login',
      register:  '/auth/register',
      dashboard: '/api/dashboard'
    }
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api',  mainRoutes);   // Main CRUD + file routes
app.use('/auth', authRoutes);   // Auth: register, login, logout
app.use('/chat', chatRoutes);   // Socket.io HTTP endpoints

// ─── CONCEPT 8: Socket.io - Full Duplex Real-time Communication ───────────────
require('./config/socket')(io);

// ─── Error Handling (Concept 1 - error-handling middleware) ───────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n✅ Server running on http://localhost:${PORT}`);
  console.log(`📌 SSR Home:       http://localhost:${PORT}/`);
  console.log(`📌 API Routes:     http://localhost:${PORT}/api`);
  console.log(`📌 Auth Routes:    http://localhost:${PORT}/auth`);
  console.log(`📌 Socket.io:      ws://localhost:${PORT}`);
  console.log(`📌 Chat Room:      http://localhost:${PORT}/chat/room\n`);
});
