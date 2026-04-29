/**
 * CONCEPT 6 & 7 – Authentication with Passport JS
 *
 * Passport supports "strategies" (plugins) for authentication.
 * We configure:
 *   1. LocalStrategy  – username/password login using bcrypt
 *   2. serializeUser / deserializeUser – for session-based persistence
 */

const LocalStrategy = require('passport-local').Strategy;
const bcrypt        = require('bcryptjs');
const User          = require('../models/User');

module.exports = (passport) => {

  // ── Local Strategy: authenticate via email + password ──────────────────────
  passport.use('local', new LocalStrategy(
    { usernameField: 'email' },          // use 'email' field instead of 'username'
    async (email, password, done) => {
      try {
        // 1. Find user in DB
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return done(null, false, { message: 'No user found with that email' });
        }

        // 2. Compare plain password with hashed password using bcrypt
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }

        // 3. Auth successful — pass user to serializeUser
        return done(null, user);

      } catch (err) {
        return done(err);
      }
    }
  ));

  // ── Session persistence ────────────────────────────────────────────────────
  // serialize: what to store in the session (just the ID)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // deserialize: look up user by ID on each request
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
