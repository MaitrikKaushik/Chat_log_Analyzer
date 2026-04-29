/**
 * CONCEPT 3 & 4 – Databases, SQL vs NoSQL, Connecting MongoDB, ODM-Mongoose
 *
 * SQL (Relational):  tables, rows, fixed schema, joins (MySQL, PostgreSQL)
 * NoSQL (Document):  flexible schema, JSON-like docs, horizontal scale (MongoDB)
 *
 * MongoDB is NoSQL. We connect via Mongoose (ODM = Object Data Modeler).
 * Mongoose gives us: Schema, Model, validation, and query helpers.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-analyzer', {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);

  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚠️  Running without DB (some features will be limited)');
    // Don't crash — allow app to run with in-memory fallback
  }
};

// Mongoose connection events (lifecycle hooks)
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB Disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`❌ MongoDB Error: ${err.message}`);
});

module.exports = connectDB;
