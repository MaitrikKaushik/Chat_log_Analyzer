/**
 * CONCEPT 3 & 4 – ODM-Mongoose: User Model
 *
 * Mongoose Schema = blueprint of a MongoDB document
 * Mongoose Model  = class to create/read/update/delete documents
 *
 * Schema features used here:
 *  - Field types: String, Date, Boolean
 *  - Validation: required, minlength, unique, enum
 *  - Pre-save hook: hash password before saving (bcrypt)
 *  - Instance method: comparePassword()
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Define Schema ─────────────────────────────────────────────────────────────
const userSchema = new mongoose.Schema({

  username: {
    type:      String,
    required:  [true, 'Username is required'],
    trim:      true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username max 30 characters']
  },

  email: {
    type:     String,
    required: [true, 'Email is required'],
    unique:   true,
    lowercase: true,
    trim:     true,
    match:    [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },

  password: {
    type:      String,
    required:  [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },

  role: {
    type:    String,
    enum:    ['user', 'admin'],
    default: 'user'
  },

  createdAt: {
    type:    Date,
    default: Date.now
  }

}, {
  timestamps: true    // Mongoose auto-adds createdAt & updatedAt
});

// ── Pre-save Hook: Hash password before storing ───────────────────────────────
// Concept 6: bcrypt hashes password so it's never stored as plain text
userSchema.pre('save', async function (next) {
  // Only hash if password field was modified
  if (!this.isModified('password')) return next();

  const salt    = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method: Compare password on login ───────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Create and export Model ───────────────────────────────────────────────────
// mongoose.model('User', schema) → creates 'users' collection in MongoDB
const User = mongoose.model('User', userSchema);
module.exports = User;
