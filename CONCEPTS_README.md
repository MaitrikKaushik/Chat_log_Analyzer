# 📘 All 8 Concepts — Node.js Express Project

## Concept 1: Middleware

**Middleware lifecycle**: Request → Middleware Stack → Route Handler → Response

| Type | Where | Example |
|------|-------|---------|
| Application-level | `server.js` → `app.use(fn)` | `loggerMiddleware` |
| Router-level | `routes/mainRoutes.js` → `router.use(fn)` | `apiLogger` |
| Error-handling | `utils/errorHandler.js` | `errorHandler(err, req, res, next)` |
| Third-party | `server.js` | `express-session`, `passport` |
| Built-in | `server.js` | `express.json()`, `express.static()` |
| Body-parser | `server.js` | `express.urlencoded({ extended: true })` |

**How request travels in Express:**
1. Request hits `server.js`
2. Passes through `app.use()` middleware in order (logger → session → passport)
3. Hits the matching route (`/api`, `/auth`, `/chat`)
4. Router-level middleware runs next
5. Route handler sends response
6. Error-handling middleware catches any errors via `next(err)`

**Blocking vs Non-blocking code:**
- **Blocking**: `fs.readFileSync()` — halts the event loop
- **Non-blocking**: `fs.readFile()`, `async/await` — doesn't block other requests

---

## Concept 2: SSR vs CSR + Template Engines

| | SSR | CSR |
|-|-----|-----|
| Rendering | Server builds HTML → sends complete page | Browser downloads JS → renders page |
| Example | EJS, HBS with `res.render()` | React, Vue |
| SEO | ✅ Good | ❌ Harder |
| Initial load | Faster first paint | Slower first load |

**EJS in this project:**
```js
// server.js
app.set('view engine', 'ejs');
app.set('views', './views');

// Route
res.render('index', { title: 'Chat Analyzer', user: req.session.user });
```
EJS syntax: `<%= variable %>` outputs escaped HTML, `<% code %>` runs JS logic.

**HBS (Handlebars)** is similar: `{{ variable }}` and `{{#if condition}}`.

---

## Concept 3 & 4: Databases, MongoDB, Mongoose ODM

**SQL vs NoSQL:**
| | SQL (MySQL, PostgreSQL) | NoSQL (MongoDB) |
|-|------------------------|-----------------|
| Structure | Tables, rows, fixed schema | Collections, documents, flexible |
| Relations | Foreign keys, JOINs | Embedded documents or references |
| Scale | Vertical | Horizontal |
| Query | SQL language | JS/JSON-based |

**Connecting MongoDB (`config/database.js`):**
```js
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
```

**Mongoose ODM (`models/User.js`):**
- `Schema` = defines structure + validation
- `Model` = class to perform CRUD on a collection
- `pre('save')` = hook that runs before saving (used to hash passwords)

---

## Concept 5: Session Management — Cookies & Express-Sessions

**Cookie**: Small data stored in browser, sent with every request automatically.

**Session**: Server stores user data, gives browser a cookie with just the Session ID.

```js
// server.js
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 3600000 }
}));

// Store data in session
req.session.user = { id, username, role };

// Read session
const user = req.session.user;

// Destroy session on logout
req.session.destroy();
```

---

## Concept 6 & 7: Authentication — Bcrypt + JWT + Passport JS

**Bcrypt** (`middleware/authMiddleware.js`, `models/User.js`):
- Hashes passwords before storing — can never be reversed
- `bcrypt.hash(password, 10)` → hashed string
- `bcrypt.compare(input, hash)` → true/false

**JWT (JSON Web Token)**:
- Stateless token containing: header + payload + signature
- Server signs it with a secret, client stores it and sends in `Authorization: Bearer <token>`
- No session needed — server just verifies the signature

```js
const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

**Passport JS** (`config/passport.js`):
- Plugin-based authentication framework
- Strategies: `passport-local` (username/password), `passport-google-oauth`, `passport-jwt`, etc.
- `serializeUser` → what to save in session after login
- `deserializeUser` → re-fetch user on each request using session data

---

## Concept 8: Full Duplex Communication — Socket.io

**Traditional HTTP**: Client requests → Server responds → Connection closed.

**Full Duplex (WebSocket)**: Persistent connection where BOTH sides can send at ANY time.

```
Client  ←──── socket.on('chat:message') ────  Server
Client  ────── socket.emit('chat:message') ──► Server
```

**Socket.io events used (`config/socket.js`):**
| Event | Direction | Purpose |
|-------|-----------|---------|
| `user:join` | client → server | announce username |
| `chat:message` | both ways | send/receive messages |
| `room:join` | client → server | join a room |
| `user:online` | server → all | broadcast online users |
| `typing:start/stop` | client → others | typing indicator |
| `disconnect` | auto | client left |

**Rooms**: Group sockets so messages only go to members of that room.
```js
socket.join('room1');          // join room
io.to('room1').emit('event');  // send only to room1
```
