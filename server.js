// Backend: server.js
const express = require('express');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let users = [];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle new user joining
  socket.on('join', () => {
    users.push(socket.id);
    if (users.length >= 2) {
      const [user1, user2] = users.splice(0, 2);
      io.to(user1).emit('matched', user2);
      io.to(user2).emit('matched', user1);
    }
  });

  // Relay signaling data
  socket.on('signal', (data) => {
    io.to(data.to).emit('signal', { from: socket.id, signal: data.signal });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    users = users.filter((id) => id !== socket.id);
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
