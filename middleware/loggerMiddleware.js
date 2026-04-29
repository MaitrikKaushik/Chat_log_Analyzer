/**
 * CONCEPT 1 – Middleware Lifecycle & Application-Level Middleware
 *
 * Middleware = a function that runs BETWEEN the request and the response.
 * Signature: (req, res, next) => { ... }
 *
 * Middleware Lifecycle:
 *   1. Request arrives at Express
 *   2. Passes through each middleware in order (app.use / router.use)
 *   3. Each middleware can: modify req/res, end the cycle, or call next()
 *   4. If next() is called → moves to the next middleware/route handler
 *   5. Response is finally sent back to the client
 *
 * Types of Middleware:
 *   - Application-level: app.use(fn) — runs on every request   ← this file
 *   - Router-level:      router.use(fn) — scoped to a router   ← see routes/
 *   - Error-handling:    (err, req, res, next) — 4 parameters  ← errorHandler.js
 *   - Third-party:       express-session, passport, etc.        ← server.js
 *   - Built-in:          express.json(), express.static()       ← server.js
 */

const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const { method, path, ip } = req;

  // ── STEP 1: Log incoming request (request phase) ──────────────────────────
  console.log(`\n📥 [REQUEST] ${method} ${path}`);
  console.log(`   📍 IP:    ${ip}`);
  console.log(`   🍪 Session ID: ${req.sessionID || 'none'}`);
  console.log(`   ⏱️  Time:  ${new Date().toISOString()}`);

  // ── STEP 2: Hook into response to log it (response phase) ────────────────
  const originalSend = res.send;
  res.send = function (data) {
    const duration   = Date.now() - startTime;
    const statusCode = res.statusCode;

    let icon = '✅';
    if (statusCode >= 300 && statusCode < 400) icon = '➡️';
    if (statusCode >= 400) icon = '❌';

    console.log(`📤 [RESPONSE] ${icon} ${statusCode} — ${duration}ms`);
    return originalSend.call(this, data);
  };

  // ── STEP 3: call next() to continue to the next middleware/route ──────────
  next();
};

module.exports = loggerMiddleware;
