import mongoose from 'mongoose';

const cultureRuleSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isPositive: { type: Boolean, default: true }
}, { _id: false });

const cultureTipSchema = new mongoose.Schema({
  bad: { type: String, required: true },
  good: { type: String, required: true }
}, { _id: false });

const cultureTypeSchema = new mongoose.Schema({
  label: { type: String, required: true },
  description: { type: String, required: true }
}, { _id: false });

const cultureContentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null
  },

  title: { type: String, required: true, trim: true },
  titleJapanese: { type: String, trim: true },
  subtitle: { type: String, trim: true },
  icon: { type: String, default: '📚' },

  contentType: {
    type: String,
    enum: ['rules', 'tips', 'types'],
    default: 'rules'
  },

  rules: [cultureRuleSchema],
  tips: [cultureTipSchema],
  types: [cultureTypeSchema],

  videoUrl: { type: String },
  sortOrder: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

cultureContentSchema.index({ companyId: 1, isActive: 1 });
cultureContentSchema.index({ companyId: 1, sortOrder: 1 });

const CultureContent = mongoose.model('CultureContent', cultureContentSchema);

export default CultureContent;
