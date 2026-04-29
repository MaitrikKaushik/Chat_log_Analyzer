/**
 * CONCEPT 8 – Full Duplex Communication with Socket.io
 *
 * Traditional HTTP: client sends request → server replies → connection closes.
 * Full Duplex (WebSocket/Socket.io):
 *   - Persistent bidirectional connection
 *   - Both client AND server can send messages at ANY time
 *   - Real-time: chat, live updates, notifications
 *
 * Socket.io events:
 *   connection   – a new client connected
 *   disconnect   – client disconnected
 *   chat message – custom event (emit/on)
 *   join room    – group clients into rooms
 */

module.exports = (io) => {

  // Track online users: socketId → username
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 [Socket.io] Client connected: ${socket.id}`);

    // ── Event: User joins with a username ──────────────────────────────────
    socket.on('user:join', (username) => {
      onlineUsers.set(socket.id, username);
      socket.username = username;

      // Broadcast to ALL clients that a new user joined
      io.emit('user:online', {
        users:   Array.from(onlineUsers.values()),
        message: `${username} joined the chat`
      });

      console.log(`👤 ${username} joined (${socket.id})`);
    });

    // ── Event: User sends a chat message ───────────────────────────────────
    socket.on('chat:message', (data) => {
      const message = {
        id:        Date.now(),
        username:  socket.username || 'Anonymous',
        text:      data.text,
        room:      data.room || 'general',
        timestamp: new Date().toISOString()
      };

      // If room specified → send only to that room; else broadcast to all
      if (data.room) {
        io.to(data.room).emit('chat:message', message);
      } else {
        io.emit('chat:message', message);
      }

      console.log(`💬 [${message.room}] ${message.username}: ${message.text}`);
    });

    // ── Event: User sends a private message (direct DM) ────────────────────
    socket.on('chat:private', (data) => {
      let targetSocketId = null;
      for (const [sId, uname] of onlineUsers.entries()) {
        if (uname === data.toUsername) {
          targetSocketId = sId;
          break;
        }
      }

      const message = {
        id:        Date.now(),
        username:  socket.username || 'Anonymous',
        text:      data.text,
        isPrivate: true,
        to:        data.toUsername,
        timestamp: new Date().toISOString()
      };

      if (targetSocketId) {
        io.to(targetSocketId).emit('chat:message', message);
        socket.emit('chat:message', message); // send to self as well
      } else {
        socket.emit('chat:message', { 
          id: Date.now(), 
          username: 'System', 
          text: `User ${data.toUsername} is not online.`, 
          isPrivate: true, 
          timestamp: new Date().toISOString() 
        });
      }
    });

    // ── Event: User joins a room ────────────────────────────────────────────
    socket.on('room:join', (roomName) => {
      socket.join(roomName);
      socket.currentRoom = roomName;

      // Notify only people in that room
      io.to(roomName).emit('room:notification', {
        message:   `${socket.username} joined room: ${roomName}`,
        timestamp: new Date().toISOString()
      });

      console.log(`🏠 ${socket.username} joined room: ${roomName}`);
    });

    // ── Event: Typing indicator ─────────────────────────────────────────────
    socket.on('typing:start', () => {
      socket.broadcast.emit('typing:indicator', {
        username: socket.username,
        typing:   true
      });
    });

    socket.on('typing:stop', () => {
      socket.broadcast.emit('typing:indicator', {
        username: socket.username,
        typing:   false
      });
    });

    // ── Event: Disconnect ───────────────────────────────────────────────────
    socket.on('disconnect', () => {
      const username = onlineUsers.get(socket.id) || 'Unknown';
      onlineUsers.delete(socket.id);

      io.emit('user:online', {
        users:   Array.from(onlineUsers.values()),
        message: `${username} left the chat`
      });

      console.log(`🔴 [Socket.io] ${username} disconnected (${socket.id})`);
    });
  });
};
