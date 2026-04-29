/**
 * CONCEPT 8 – Chat Room Routes (HTTP side of Socket.io)
 *
 * The actual real-time communication happens over WebSocket (config/socket.js),
 * but we need HTTP routes to serve the chat room HTML page.
 */

const express = require('express');
const router  = express.Router();

// GET /chat/room — serves the real-time chat room (SSR page with Socket.io client)
router.get('/room', (req, res) => {
  res.render('chatRoom', {
    title:     'Live Chat Room',
    username:  req.session.user?.username || 'Guest_' + Math.floor(Math.random() * 1000),
    socketUrl: `http://localhost:${process.env.PORT || 3000}`
  });
});

// GET /chat/info — info about Socket.io capabilities
router.get('/info', (req, res) => {
  res.json({
    success: true,
    concept: 'Concept 8 — Full Duplex Communication',
    technology: 'Socket.io (WebSocket + fallback to polling)',
    features: [
      'Real-time bidirectional messaging',
      'Room-based chat (join specific rooms)',
      'Typing indicators',
      'Online users list',
      'Server can push data to client WITHOUT a request'
    ],
    howToConnect: {
      client: 'Include socket.io client script, then: const socket = io()',
      events: {
        emit: ['user:join', 'chat:message', 'room:join', 'typing:start', 'typing:stop'],
        listen: ['chat:message', 'user:online', 'room:notification', 'typing:indicator']
      }
    }
  });
});

module.exports = router;
