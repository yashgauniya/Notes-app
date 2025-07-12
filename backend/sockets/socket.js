import { Server } from 'socket.io';
import Note from '../models/NoteModel.js';

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  const saveNoteToDB = async (noteId, content, title) => {
    try {
      await Note.findByIdAndUpdate(noteId, {
        content,
        title,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  io.on('connection', (socket) => {
    const saveIntervals = {};

    socket.on('join_note', async (noteId) => {
      socket.join(noteId);
      updateUserCount(noteId);

      const note = await Note.findById(noteId);
      if (note) {
        socket.emit('initial_data', {
          content: note.content,
          title: note.title,
          updatedAt: note.updatedAt
        });
      }
    });

    socket.on('note_update', async ({ noteId, content }) => {
      socket.to(noteId).emit('note_update', {
        content,
        updatedAt: new Date()
      });

      if (!saveIntervals[noteId]) {
        saveIntervals[noteId] = setInterval(() => {
          saveNoteToDB(noteId, content);
        }, 5000);
      }
    });

    socket.on('title_update', async ({ noteId, title }) => {
      socket.to(noteId).emit('title_update', {
        title,
        updatedAt: new Date()
      });
      await saveNoteToDB(noteId, null, title);
    });

    socket.on('disconnect', () => {
      Object.keys(saveIntervals).forEach(noteId => {
        const room = io.sockets.adapter.rooms.get(noteId);
        if (!room || room.size === 0) {
          clearInterval(saveIntervals[noteId]);
          delete saveIntervals[noteId];
        }
      });
    });

    const updateUserCount = (roomId) => {
      const userCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      io.to(roomId).emit('active_users', userCount);
    };
  });
};