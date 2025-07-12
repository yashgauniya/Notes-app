const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const connectToDatabase = require('./config/connectToDatabase');
const noteRoutes = require('./routes/noteRoutes');
const { Server } = require('socket.io');
const Note = require('./models/NoteModel');

// .env file configuration
dotenv.config();

// Express app 
const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', noteRoutes);

// Connect to MongoDB
connectToDatabase();

// Active users tracking
const activeUsers = {};
const socketToRoomMap = {};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('join_note', (noteId) => {
    socket.join(noteId);


    socketToRoomMap[socket.id] = noteId;

    if (!activeUsers[noteId]) {
      activeUsers[noteId] = new Set();
    }

    activeUsers[noteId].add(socket.id);


    io.to(noteId).emit('active_users', activeUsers[noteId].size);
  });

  socket.on('note_update', ({ noteId, content }) => {
    socket.to(noteId).emit('note_updated_from_server', content);
  });

  socket.on('disconnect', () => {
    const noteId = socketToRoomMap[socket.id];

    if (noteId && activeUsers[noteId]) {
      activeUsers[noteId].delete(socket.id);

      if (activeUsers[noteId].size === 0) {
        delete activeUsers[noteId];
      } else {
        io.to(noteId).emit('active_users', activeUsers[noteId].size);
      }
    }

    delete socketToRoomMap[socket.id];

    console.log('User disconnected:', socket.id);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
