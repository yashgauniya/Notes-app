const express = require('express');
const router = express.Router();
const Note = require('../models/NoteModel');


router.post('/notes', async (req, res) => {
  try {
    const { title } = req.body;

    const newNote = new Note({ title });
    const savedNote = await newNote.save();

    res.status(201).json(savedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error while creating note' });
  }
});


router.get('/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error while fetching note' });
  }
});


router.put('/notes/:id', async (req, res) => {
  try {
    const noteId = req.params.id;
    const { content } = req.body;

    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { content, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found for update' });
    }

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: 'Error while updating note' });
  }
});

module.exports = router;
