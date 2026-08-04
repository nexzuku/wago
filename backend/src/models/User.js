import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  
  role: {
    type: String,
    enum: ['admin', 'manager', 'employee'],
    default: 'employee'
  },
  
  profile: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    avatar: String,
    department: String,
    position: String
  },
  
  // Employee-specific
  assignedTopics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
  }],
  assignedVoiceId: { type: String, default: null },
  
  // Training Progress
  progress: {
    totalPhrasesPracticed: {
      type: Number,
      default: 0
    },
    totalTimeMinutes: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActiveAt: Date,
    skills: {
      fluency: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      pronunciation: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      grammar: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      },
      pitch: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }
  },
  
  // Daily Goals
  dailyGoals: {
    phrasesTarget: { type: Number, default: 10 },
    minutesTarget: { type: Number, default: 5 },
    phrasesToday: { type: Number, default: 0 },
    minutesToday: { type: Number, default: 0 },
    lastResetDate: { type: String, default: '' }
  },

  // Gamification
  stars: {
    type: Number,
    default: 0
  },
  badges: [String],
  
  // Auth
  refreshTokens: [String],
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
  
  // Invite tracking
  invitedAt: Date,
  inviteExpiresAt: Date,
  
  status: {
    type: String,
    enum: ['active', 'inactive', 'invited', 'expired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Compound unique index for email within company
userSchema.index({ companyId: 1, email: 1 }, { unique: true });
userSchema.index({ companyId: 1, role: 1 });
userSchema.index({ companyId: 1, status: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.profile?.firstName && this.profile?.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.profile?.firstName || this.email;
});

// Hash password before saving
userSchema.methods.setPassword = async function(password) {
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(password, salt);
};

// Compare password
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

// Remove sensitive fields when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
