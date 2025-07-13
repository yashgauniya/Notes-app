import { Server } from 'socket.io';
import Note from '../models/NoteModel.js';

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  const saveNoteToDB = async (noteId, content, title = null) => {
    try {
      const updateData = { updatedAt: new Date() };
      if (content !== null) updateData.content = content;
      if (title !== null) updateData.title = title;

      await Note.findByIdAndUpdate(noteId, updateData, { new: true });
    } catch (error) {
      console.error('DB Save Error:', error);
    }
  };

  io.on('connection', (socket) => {
    const saveTimeouts = {};

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

    socket.on('note_update', ({ noteId, content }) => {
      socket.to(noteId).emit('note_update', { content, updatedAt: new Date() });

      if (saveTimeouts[noteId]) {
        clearTimeout(saveTimeouts[noteId]);
      }

      saveTimeouts[noteId] = setTimeout(() => {
        saveNoteToDB(noteId, content);
        delete saveTimeouts[noteId];
      }, 5000);
    });

    socket.on('title_update', async ({ noteId, title }) => {
      socket.to(noteId).emit('title_update', { title, updatedAt: new Date() });
      await saveNoteToDB(noteId, null, title);
    });

    socket.on('disconnecting', () => {
      for (const noteId of socket.rooms) {
        if (saveTimeouts[noteId]) {
          clearTimeout(saveTimeouts[noteId]);
          delete saveTimeouts[noteId];
        }
      }
    });

    const updateUserCount = (roomId) => {
      const userCount = io.sockets.adapter.rooms.get(roomId)?.size || 0;
      io.to(roomId).emit('active_users', userCount);
    };
  });
};
