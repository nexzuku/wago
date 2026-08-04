import mongoose from 'mongoose';

const phraseSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null // null = global phrase
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic',
    required: true
  },
  
  japanese: {
    type: String,
    required: true,
    trim: true
  },
  romaji: {
    type: String,
    required: true,
    trim: true
  },
  english: {
    type: String,
    required: true,
    trim: true
  },
  
  // Audio
  audioUrl: String,
  audioGeneratedAt: Date,
  
  // Metadata
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  tags: [String],
  usageContext: String,
  
  // For emergency phrases
  isEmergency: {
    type: Boolean,
    default: false
  },
  emergencyCategory: {
    type: String,
    enum: ['medical', 'safety', 'help', null],
    default: null
  },
  
  sortOrder: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
phraseSchema.index({ topicId: 1, isActive: 1 });
phraseSchema.index({ companyId: 1, isEmergency: 1 });
phraseSchema.index({ tags: 1 });

const Phrase = mongoose.model('Phrase', phraseSchema);

export default Phrase;
