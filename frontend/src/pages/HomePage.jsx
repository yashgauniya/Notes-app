import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [noteTitle, setNoteTitle] = useState('');
  const navigate = useNavigate();

  const handleCreateNote = async () => {
    if (!noteTitle.trim()) {
      alert('Please enter a note title');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/notes', {
        title: noteTitle,
      });

      const createdNote = response.data;
      navigate(`/note/${createdNote._id}`);
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Something went wrong while creating the note.');
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create New Note</h2>
      <input
        type="text"
        value={noteTitle}
        onChange={(e) => setNoteTitle(e.target.value)}
        placeholder="Enter note title"
        style={styles.input}
      />
      <button onClick={handleCreateNote} style={styles.button}>
        Create Note
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    textAlign: 'center',
  },
  input: {
    padding: '10px',
    width: '300px',
    marginRight: '10px',
    fontSize: '16px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default HomePage;
