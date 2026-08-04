import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true,
    enum: ['user', 'company', 'voice', 'content', 'topic', 'phrase', 'session', 'settings']
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  
  details: mongoose.Schema.Types.Mixed,
  
  ipAddress: String,
  userAgent: String
}, {
  timestamps: true
});

// Indexes
auditLogSchema.index({ companyId: 1, createdAt: -1 });
auditLogSchema.index({ companyId: 1, action: 1 });
auditLogSchema.index({ companyId: 1, userId: 1 });

// Auto-delete logs older than 90 days
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
