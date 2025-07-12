import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import NoteEditorPage from './pages/NoteEditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/note/:id" element={<NoteEditorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
