# Node.js + Express.js Learning & Implementation Checklist

## ✅ Concept 1: Middleware Mastery
- [ ] **Middleware Lifecycle**
  - [ ] Understand the request-response cycle
  - [ ] Learn `next()` function and middleware chaining
  - [ ] Study synchronous vs asynchronous middleware flow
  
- [ ] **Application-Level Middleware**
  - [ ] `app.use()` for global middleware
  - [ ] `app.get/post/put/delete()` for specific routes
  - [ ] `app.all()` for all HTTP methods
  
- [ ] **Router-Level Middleware**
  - [ ] Create modular routers with `express.Router()`
  - [ ] Apply middleware to specific router instances
  - [ ] Mount routers with `app.use('/path', router)`
  
- [ ] **Error-Handling Middleware**
  - [ ] 4-parameter signature: `(err, req, res, next)`
  - [ ] Centralized error handling
  - [ ] Custom error classes
  
- [ ] **Third-Party Middleware**
  - [ ] `body-parser` (or `express.json()`, `express.urlencoded()`)
  - [ ] `cors`
  - [ ] `helmet`
  - [ ] `morgan` (logging)
  - [ ] `compression`
  
- [ ] **Request Flow Understanding**
  - [ ] How request travels through middleware stack
  - [ ] Blocking vs Non-blocking code
  - [ ] Event loop and async operations

---

## ✅ Concept 2: SSR vs CSR & Template Engines
- [ ] **SSR (Server-Side Rendering)**
  - [ ] Understand when to use SSR (SEO, initial load)
  - [ ] Render templates on server before sending to client
  
- [ ] **CSR (Client-Side Rendering)**
  - [ ] Understand SPA architecture
  - [ ] API + Frontend framework separation
  
- [ ] **EJS Template Engine**
  - [ ] Install and configure EJS
  - [ ] `app.set('view engine', 'ejs')`
  - [ ] Create views folder structure
  - [ ] Syntax: `<%= %>`, `<%- %>`, `<% %>`
  - [ ] Partials and includes
  - [ ] Layouts with `express-ejs-layouts`
  
- [ ] **Handlebars (HBS)**
  - [ ] Install `hbs` or `express-handlebars`
  - [ ] Configure view engine
  - [ ] Helpers and partials
  - [ ] Block helpers

---

## ✅ Concept 3 & 4: Databases (MongoDB + Mongoose)
- [ ] **SQL vs NoSQL Concepts**
  - [ ] Understand ACID properties
  - [ ] Schema vs Schema-less design
  - [ ] When to use SQL (relational data) vs NoSQL (flexible, scalable)
  
- [ ] **MongoDB Setup**
  - [ ] Install MongoDB locally or use MongoDB Atlas
  - [ ] Understand BSON format
  - [ ] Basic MongoDB shell commands
  - [ ] Collections and Documents
  
- [ ] **Connecting MongoDB to Node.js**
  - [ ] Install `mongodb` native driver
  - [ ] Connection string (URI)
  - [ ] Handle connection events
  
- [ ] **Mongoose ODM**
  - [ ] Install and setup Mongoose
  - [ ] Create Schemas
  - [ ] Define Models
  - [ ] Schema Types (String, Number, Date, Boolean, ObjectId, Array)
  - [ ] Validation (required, min, max, enum, custom validators)
  - [ ] Default values
  - [ ] Schema methods and statics
  
- [ ] **CRUD Operations with Mongoose**
  - [ ] Create: `Model.create()`, `new Model().save()`
  - [ ] Read: `find()`, `findOne()`, `findById()`
  - [ ] Update: `updateOne()`, `findByIdAndUpdate()`
  - [ ] Delete: `deleteOne()`, `findByIdAndDelete()`
  
- [ ] **Query Building**
  - [ ] Chaining queries
  - [ ] Select, sort, limit, skip
  - [ ] Population (referencing other documents)

---

## ✅ Concept 5: Session Management
- [ ] **Cookies Fundamentals**
  - [ ] HTTP-only cookies
  - [ ] Secure and SameSite attributes
  - [ ] Signed cookies
  - [ ] Cookie expiration (maxAge, expires)
  - [ ] `res.cookie()` and `req.cookies`
  
- [ ] **Express-Session**
  - [ ] Install `express-session`
  - [ ] Session configuration (secret, resave, saveUninitialized)
  - [ ] Session store options (MemoryStore, connect-mongo, redis)
  - [ ] `req.session` object
  - [ ] Session persistence
  - [ ] Session destruction (logout)
  - [ ] Session-based flash messages

---

## ✅ Concept 6 & 7: Authentication
- [ ] **Password Security with Bcrypt**
  - [ ] Install `bcrypt` or `bcryptjs`
  - [ ] Hashing: `bcrypt.hash(password, saltRounds)`
  - [ ] Comparing: `bcrypt.compare(password, hash)`
  - [ ] Salt rounds concept
  - [ ] Never store plain text passwords
  
- [ ] **JWT (JSON Web Tokens)**
  - [ ] Install `jsonwebtoken`
  - [ ] JWT structure: Header.Payload.Signature
  - [ ] `jwt.sign()` to create tokens
  - [ ] `jwt.verify()` to validate tokens
  - [ ] Access tokens vs Refresh tokens
  - [ ] Store JWT in HttpOnly cookie or Authorization header
  - [ ] Token expiration and renewal
  - [ ] JWT middleware for protected routes
  
- [ ] **Passport.js**
  - [ ] Install `passport` and strategies (`passport-local`, `passport-jwt`)
  - [ ] Local Strategy (username/password)
  - [ ] JWT Strategy (token verification)
  - [ ] Serialize/Deserialize users
  - [ ] `passport.authenticate()` middleware
  - [ ] OAuth strategies (Google, GitHub) - optional
  
- [ ] **Auth Flow Implementation**
  - [ ] Registration endpoint
  - [ ] Login endpoint
  - [ ] Protected route middleware
  - [ ] Logout functionality
  - [ ] Password reset flow

---

## ✅ Concept 8: Socket.io (Real-time Communication)
- [ ] **Full Duplex Communication Concepts**
  - [ ] HTTP vs WebSocket
  - [ ] Polling vs WebSocket
  - [ ] Bidirectional event-based communication
  
- [ ] **Socket.io Setup**
  - [ ] Install `socket.io`
  - [ ] Integrate with Express server
  - [ ] Client-side socket.io-client setup
  
- [ ] **Core Features**
  - [ ] `io.on('connection')` event
  - [ ] `socket.emit()` - send to specific client
  - [ ] `io.emit()` - broadcast to all clients
  - [ ] `socket.broadcast.emit()` - broadcast to all except sender
  - [ ] `socket.on()` - listen for events
  - [ ] Rooms and namespaces
  
- [ ] **Advanced Features**
  - [ ] Join/leave rooms: `socket.join()`, `socket.leave()`
  - [ ] Emit to specific room: `io.to(room).emit()`
  - [ ] Acknowledgements (callbacks)
  - [ ] Middleware for socket connections
  - [ ] Authentication with JWT in socket handshake
  
- [ ] **Common Use Cases**
  - [ ] Real-time chat application
  - [ ] Live notifications
  - [ ] Collaborative editing
  - [ ] Live dashboards

---

## 📋 Project Structure Template
```
project/
├── config/
│   ├── database.js       # MongoDB connection
│   └── passport.js       # Passport strategies
├── middleware/
│   ├── auth.js           # JWT/Session auth middleware
│   ├── errorHandler.js   # Centralized error handling
│   └── logger.js         # Request logging
├── models/
│   └── User.js           # Mongoose schemas
├── routes/
│   ├── auth.js           # Auth routes
│   └── api.js            # API routes
├── views/                # EJS/HBS templates (if SSR)
├── public/               # Static files (CSS, JS, images)
├── utils/
│   └── helpers.js        # Utility functions
├── server.js             # Entry point
└── .env                  # Environment variables
```

---

## 🔧 Essential Dependencies
```bash
# Core
npm install express dotenv

# Middleware
npm install cors helmet morgan compression

# Database
npm install mongoose

# Authentication
npm install bcrypt jsonwebtoken passport passport-local passport-jwt express-session

# Template Engine (choose one)
npm install ejs
# OR
npm install express-handlebars

# Real-time
npm install socket.io

# Session Store (for production)
npm install connect-mongo
```

---

## 🎯 Learning Path Recommendation
1. **Week 1**: Concepts 1-2 (Middleware + Templates)
2. **Week 2**: Concepts 3-4 (MongoDB + Mongoose)
3. **Week 3**: Concept 5 (Sessions)
4. **Week 4**: Concepts 6-7 (Authentication)
5. **Week 5**: Concept 8 (Socket.io)
6. **Week 6**: Build a complete project combining all concepts

---

**Status**: Track your progress by checking off completed items ⬜ ➡️ ✅
