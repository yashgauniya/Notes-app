const setupSocket = (io) => {
  const noteRooms = {};

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_note', (noteId) => {
      socket.join(noteId);

      if (!noteRooms[noteId]) {
        noteRooms[noteId] = new Set();
      }

      noteRooms[noteId].add(socket.id);


      io.to(noteId).emit('active_users', noteRooms[noteId].size);


      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        noteRooms[noteId]?.delete(socket.id);
        io.to(noteId).emit('active_users', noteRooms[noteId]?.size || 0);
      });
    });


    socket.on('note_update', ({ noteId, content }) => {
      socket.to(noteId).emit('note_updated_from_server', content);
    });
  });
};

module.exports = setupSocket;
