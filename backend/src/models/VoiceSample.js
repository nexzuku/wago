import mongoose from 'mongoose';

const voiceSampleSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  duration: Number, // seconds
  
  // Processing status
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'analyzed', 'used', 'failed'],
    default: 'uploaded'
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  analysisResult: mongoose.Schema.Types.Mixed,
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
voiceSampleSchema.index({ companyId: 1, status: 1 });
voiceSampleSchema.index({ companyId: 1, createdAt: -1 });

const VoiceSample = mongoose.model('VoiceSample', voiceSampleSchema);

export default VoiceSample;
