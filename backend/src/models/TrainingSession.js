import mongoose from 'mongoose';

const attemptSchema = new mongoose.Schema({
  phraseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phrase',
    required: true
  },
  userAudio: String,
  userTranscript: String,
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  feedback: String,
  attemptedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const conversationMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  audioUrl: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const trainingSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  },
  
  mode: {
    type: String,
    enum: ['listen_repeat', 'test', 'free_talk'],
    required: true
  },
  
  startedAt: {
    type: Date,
    default: Date.now
  },
  endedAt: Date,
  durationMinutes: {
    type: Number,
    default: 0
  },
  
  // Results
  phrasesAttempted: {
    type: Number,
    default: 0
  },
  phrasesCorrect: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  
  // Detailed attempts
  attempts: [attemptSchema],
  
  // Free Talk specific
  conversation: [conversationMessageSchema],
  
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
trainingSessionSchema.index({ userId: 1, createdAt: -1 });
trainingSessionSchema.index({ companyId: 1, createdAt: -1 });
trainingSessionSchema.index({ userId: 1, mode: 1 });

// Calculate duration when session ends
trainingSessionSchema.methods.complete = function() {
  this.endedAt = new Date();
  this.isCompleted = true;
  this.durationMinutes = Math.round((this.endedAt - this.startedAt) / 60000);
  
  if (this.attempts.length > 0) {
    this.phrasesAttempted = this.attempts.length;
    this.phrasesCorrect = this.attempts.filter(a => a.score >= 70).length;
    this.averageScore = Math.round(
      this.attempts.reduce((sum, a) => sum + (a.score || 0), 0) / this.attempts.length
    );
  }
};

const TrainingSession = mongoose.model('TrainingSession', trainingSessionSchema);

export default TrainingSession;
