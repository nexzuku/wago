import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null // null = global topic
  },

  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    default: '📚'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },

  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  category: {
    type: String,
    enum: ['greetings', 'business', 'safety', 'technical', 'daily', 'emergency', 'custom'],
    default: 'custom'
  },

  // AI Context Fields - admin provides these so AI understands the topic domain
  backgroundContext: {
    type: String,
    trim: true,
    default: ''
    // e.g. "This topic covers construction site safety including PPE, scaffolding, crane operations..."
  },
  aiInstructions: {
    type: String,
    trim: true,
    default: ''
    // e.g. "Use polite keigo forms, focus on safety-critical vocabulary, be strict about pronunciation"
  },
  vocabularyList: [{
    japanese: { type: String, trim: true },
    romaji: { type: String, trim: true },
    english: { type: String, trim: true }
  }],
  conversationStarters: [{
    prompt: { type: String, trim: true },
    description: { type: String, trim: true }
    // e.g. { prompt: "You need to ask your supervisor about safety equipment", description: "Practice requesting PPE" }
  }],

  // Assignment
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  assignedToAll: {
    type: Boolean,
    default: true
  },

  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Generate slug from name
topicSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes
topicSchema.index({ companyId: 1, isActive: 1 });
topicSchema.index({ companyId: 1, category: 1 });


const Topic = mongoose.model('Topic', topicSchema);

export default Topic;
