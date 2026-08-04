import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['document', 'video', 'audio', 'pdf', 'image'],
    required: true
  },
  
  fileUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: String,
  mimeType: String,
  size: Number,
  
  topicIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  
  visibility: {
    type: String,
    enum: ['all', 'managers', 'specific'],
    default: 'all'
  },
  visibleTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  completions: {
    type: Number,
    default: 0
  },
  avgTimeSpent: {
    type: Number,
    default: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
contentSchema.index({ companyId: 1, type: 1 });
contentSchema.index({ companyId: 1, topicIds: 1 });
contentSchema.index({ companyId: 1, isActive: 1 });

const Content = mongoose.model('Content', contentSchema);

export default Content;
