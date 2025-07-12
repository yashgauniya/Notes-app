import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  title: String,
  content: String,
  updatedAt: { type: Date, default: Date.now },
  versions: [{
    content: String,
    savedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

NoteSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    this.versions.push({
      content: this.content,
      savedAt: new Date()
    });
  }
  next();
});

export default mongoose.model('Note', NoteSchema);