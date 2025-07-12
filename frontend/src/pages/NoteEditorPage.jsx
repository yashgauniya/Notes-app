import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import axios from 'axios';

const socket = socketIOClient('http://localhost:5000');

function NoteEditorPage() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [content, setContent] = useState('');
  const [activeUsers, setActiveUsers] = useState(1);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/notes/${id}`);
        setNote(res.data);
        setContent(res.data.content || '');
      } catch (error) {
        console.error('Error fetching note:', error);
      }
    };

    fetchNote();
  }, [id]);

  useEffect(() => {
    socket.emit('join_note', id);

    socket.on('note_updated_from_server', (updatedContent) => {
      setContent(updatedContent);
    });

    socket.on('active_users', (count) => {
      setActiveUsers(count);
    });

    return () => {
      socket.off('note_updated_from_server');
      socket.off('active_users');
    };
  }, [id]);

  const handleContentChange = (e) => {
    const updatedText = e.target.value;
    setContent(updatedText);
    socket.emit('note_update', { noteId: id, content: updatedText });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      axios.put(`http://localhost:5000/api/notes/${id}`, {
        content,
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [content, id]);

  if (!note) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>{note.title}</h2>

      <p>Last updated: {new Date(note.updatedAt).toLocaleString()}</p>

      <textarea
        style={{ width: '100%', height: '300px', fontSize: '16px' }}
        value={content}
        onChange={handleContentChange}
      />
      <p>Active collaborators: {activeUsers}</p>
    </div>
  );
}

export default NoteEditorPage;
