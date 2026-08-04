import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  topicIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  contentIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  }],
  sortOrder: { type: Number, default: 0 }
}, { _id: true });

const learningPathSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },

  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  levelLabel: { type: String, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  duration: { type: String, trim: true },

  modules: [moduleSchema],

  prerequisitePathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    default: null
  },

  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

learningPathSchema.index({ companyId: 1, isActive: 1 });
learningPathSchema.index({ companyId: 1, level: 1 });

const LearningPath = mongoose.model('LearningPath', learningPathSchema);

export default LearningPath;
