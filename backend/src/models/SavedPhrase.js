import mongoose from 'mongoose';

const savedPhraseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phraseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phrase',
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

savedPhraseSchema.index({ userId: 1, phraseId: 1 }, { unique: true });
savedPhraseSchema.index({ userId: 1, topicId: 1 });

const SavedPhrase = mongoose.model('SavedPhrase', savedPhraseSchema);

export default SavedPhrase;
