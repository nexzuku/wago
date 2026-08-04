import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  industry: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  introduction: {
    type: String
  },
  
  // Branding
  logo: {
    type: String
  },
  primaryColor: {
    type: String,
    default: '#3B82F6'
  },
  loginMessage: {
    type: String
  },
  
  // Voice Settings
  voiceProfile: {
    accent: {
      type: String,
      enum: ['tokyo', 'kansai', 'kyushu', 'neutral'],
      default: 'tokyo'
    }
  },

  // Voice Clones (DeepInfra / Chatterbox Multilingual)
  voiceClones: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    deepInfraVoiceId: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['ready', 'failed'],
      default: 'ready'
    },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // SSO Config
  sso: {
    enabled: {
      type: Boolean,
      default: false
    },
    provider: {
      type: String,
      enum: ['saml', 'oauth']
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  
  // Password Policy
  passwordPolicy: {
    minLength: {
      type: Number,
      default: 8
    },
    requireUppercase: {
      type: Boolean,
      default: true
    },
    requireNumber: {
      type: Boolean,
      default: true
    },
    requireSpecial: {
      type: Boolean,
      default: false
    }
  },
  
  // Subscription
  subscription: {
    plan: {
      type: String,
      enum: ['starter', 'professional', 'enterprise'],
      default: 'starter'
    },
    employeeLimit: {
      type: Number,
      default: 10
    },
    validUntil: Date
  }
}, {
  timestamps: true
});

// Generate slug from name
companySchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Indexes
companySchema.index({ contactEmail: 1 });

const Company = mongoose.model('Company', companySchema);

export default Company;
