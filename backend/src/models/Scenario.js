import mongoose from 'mongoose';

const scenarioSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },

  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  icon: { type: String, default: '🏢' },

  category: {
    type: String,
    enum: ['daily', 'safety', 'client', 'technical', 'custom'],
    default: 'custom'
  },
  categoryLabel: { type: String, trim: true },

  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },

  duration: { type: String, trim: true },

  topicIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],

  prerequisiteScenarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scenario',
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

scenarioSchema.index({ companyId: 1, isActive: 1 });
scenarioSchema.index({ companyId: 1, category: 1 });

const Scenario = mongoose.model('Scenario', scenarioSchema);

export default Scenario;
