# Japanese Training App (WaGo) - Architecture Design

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Backend** | Node.js + Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | JWT (access + refresh tokens) |
| **Frontend** | React.js + Vite |
| **Styling** | TailwindCSS + Framer Motion |
| **Real-time** | Socket.io (Free Talk mode) |
| **File Storage** | Local `/uploads` (S3-ready) |
| **Job Queue** | Bull (Redis) for async voice cloning |

---

## External Service Integrations

### 1. Fish Audio API (Text-to-Speech + Voice Cloning)
```
Base URL: https://api.fish.audio
Authentication: Bearer token

Endpoints Used:
- POST /v1/tts          → Generate speech from text
- POST /v1/voice/clone  → Clone voice from audio samples
- GET  /v1/voice/{id}   → Get cloned voice status
```

### 2. OpenAI API (ChatGPT)
```
Base URL: https://api.openai.com/v1
Model: gpt-4o-mini

Use Cases:
- Content analysis (onboarding company info extraction)
- Pronunciation feedback generation
- Free Talk conversation responses
- Training phrase generation
```

### 3. Browser Web Speech API (Speech-to-Text)
```
Frontend-only, no server integration needed.
SpeechRecognition API with lang: 'ja-JP'
Fallback: Show browser compatibility warning
```

---

## MongoDB Models

### 1. Company
```javascript
{
  _id: ObjectId,
  name: String,                    // "ABC Construction"
  slug: String,                    // "abc-construction" (unique)
  industry: String,                // "Construction"
  address: String,
  contactEmail: String,
  introduction: String,            // Company intro for AI context
  
  // Branding
  logo: String,                    // URL to uploaded logo
  primaryColor: String,            // "#3B82F6"
  loginMessage: String,
  
  // Voice Settings
  voiceProfile: {
    fishAudioVoiceId: String,      // Cloned voice ID from Fish Audio
    accent: String,                // "tokyo" | "kansai" | "kyushu" | "neutral"
    status: String,                // "pending" | "processing" | "ready" | "failed"
    uploadedAt: Date,
    qualityScore: Number           // 0-100
  },
  
  // SSO Config
  sso: {
    enabled: Boolean,
    provider: String,              // "saml" | "oauth"
    metadata: Object
  },
  
  // Subscription
  subscription: {
    plan: String,                  // "starter" | "professional" | "enterprise"
    employeeLimit: Number,
    validUntil: Date
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

### 2. User
```javascript
{
  _id: ObjectId,
  companyId: ObjectId,             // ref: Company
  email: String,                   // unique within company
  passwordHash: String,
  
  role: String,                    // "admin" | "manager" | "employee"
  
  profile: {
    firstName: String,
    lastName: String,
    avatar: String,
    department: String,
    position: String
  },
  
  // Employee-specific
  assignedTopics: [ObjectId],      // ref: Topic[]
  
  // Training Progress
  progress: {
    totalPhrasesPracticed: Number,
    totalTimeMinutes: Number,
    currentStreak: Number,
    longestStreak: Number,
    lastActiveAt: Date,
    skills: {
      fluency: Number,             // 0-100
      pronunciation: Number,
      grammar: Number,
      pitch: Number
    }
  },
  
  // Gamification
  stars: Number,
  badges: [String],
  
  // Auth
  refreshTokens: [String],
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
  status: String,                  // "active" | "inactive" | "invited"
  
  createdAt: Date,
  updatedAt: Date
}
```

### 3. Topic
```javascript
{
  _id: ObjectId,
  companyId: ObjectId,             // ref: Company (null = global)
  
  name: String,                    // "Business Greetings"
  slug: String,
  description: String,
  icon: String,                    // Emoji or icon name
  color: String,                   // Accent color
  
  difficulty: String,              // "beginner" | "intermediate" | "advanced"
  category: String,                // "greetings" | "business" | "safety" | "technical"
  
  isActive: Boolean,
  sortOrder: Number,
  
  createdBy: ObjectId,             // ref: User
  createdAt: Date,
  updatedAt: Date
}
```

### 4. Phrase
```javascript
{
  _id: ObjectId,
  companyId: ObjectId,             // ref: Company (null = global)
  topicId: ObjectId,               // ref: Topic
  
  japanese: String,                // "おはようございます"
  romaji: String,                  // "Ohayou gozaimasu"
  english: String,                 // "Good morning"
  
  // Audio
  audioUrl: String,                // Pre-generated TTS audio
  audioGeneratedAt: Date,
  
  // Metadata
  difficulty: String,
  tags: [String],                  // ["formal", "morning", "greeting"]
  usageContext: String,            // When/how to use this phrase
  
  // For emergency phrases
  isEmergency: Boolean,
  emergencyCategory: String,       // "medical" | "safety" | "help"
  
  sortOrder: Number,
  isActive: Boolean,
  
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### 5. TrainingSession
```javascript
{
  _id: ObjectId,
  userId: ObjectId,                // ref: User
  companyId: ObjectId,             // ref: Company
  topicId: ObjectId,               // ref: Topic
  
  mode: String,                    // "listen_repeat" | "test" | "free_talk"
  
  startedAt: Date,
  endedAt: Date,
  durationMinutes: Number,
  
  // Results
  phrasesAttempted: Number,
  phrasesCorrect: Number,
  averageScore: Number,            // 0-100
  
  // Detailed attempts
  attempts: [{
    phraseId: ObjectId,
    userAudio: String,             // URL to recorded audio
    userTranscript: String,        // What user said (STT result)
    score: Number,
    feedback: String,              // AI-generated feedback
    attemptedAt: Date
  }],
  
  // Free Talk specific
  conversation: [{
    role: String,                  // "user" | "assistant"
    content: String,
    audioUrl: String,
    timestamp: Date
  }],
  
  createdAt: Date
}
```

### 6. VoiceSample
```javascript
{
  _id: ObjectId,
  companyId: ObjectId,             // ref: Company
  
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  url: String,
  duration: Number,                // seconds
  
  // Processing status
  status: String,                  // "uploaded" | "processing" | "analyzed" | "used"
  qualityScore: Number,
  analysisResult: Object,          // Fish Audio analysis response
  
  uploadedBy: ObjectId,            // ref: User
  uploadedAt: Date
}
```

### 7. Content (Training Materials)
```javascript
{
  _id: ObjectId,
  companyId: ObjectId,             // ref: Company
  
  title: String,
  description: String,
  type: String,                    // "document" | "video" | "audio" | "pdf"
  
  fileUrl: String,
  thumbnailUrl: String,
  mimeType: String,
  size: Number,
  
  topicIds: [ObjectId],            // ref: Topic[]
  visibility: String,              // "all" | "managers" | "specific"
  visibleTo: [ObjectId],           // ref: User[] (if specific)
  
  // Analytics
  views: Number,
  completions: Number,
  avgTimeSpent: Number,
  
  uploadedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### 8. AuditLog
```javascript
{
  _id: ObjectId,
  companyId: ObjectId,
  userId: ObjectId,
  
  action: String,                  // "user.created" | "voice.cloned" | "content.uploaded"
  resource: String,                // "user" | "voice" | "content" | "settings"
  resourceId: ObjectId,
  
  details: Object,                 // Action-specific data
  ipAddress: String,
  userAgent: String,
  
  createdAt: Date
}
```

---

## REST API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Company registration (onboarding) |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | Logout (invalidate refresh token) |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |
| GET | `/api/auth/me` | Get current user |

### Companies (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies/current` | Get current company |
| PUT | `/api/companies/current` | Update company profile |
| PUT | `/api/companies/current/branding` | Update branding settings |
| PUT | `/api/companies/current/sso` | Configure SSO |
| GET | `/api/companies/current/stats` | Dashboard statistics |

### Users / Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users (paginated, filterable) |
| POST | `/api/users` | Create single user |
| POST | `/api/users/bulk` | Bulk create from CSV |
| GET | `/api/users/:id` | Get user details |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Deactivate user |
| PUT | `/api/users/:id/topics` | Assign topics to user |
| GET | `/api/users/:id/progress` | Get user training progress |

### Topics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/topics` | List all topics |
| POST | `/api/topics` | Create topic |
| GET | `/api/topics/:id` | Get topic with phrases |
| PUT | `/api/topics/:id` | Update topic |
| DELETE | `/api/topics/:id` | Delete topic |

### Phrases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/topics/:topicId/phrases` | List phrases in topic |
| POST | `/api/topics/:topicId/phrases` | Create phrase |
| PUT | `/api/phrases/:id` | Update phrase |
| DELETE | `/api/phrases/:id` | Delete phrase |
| GET | `/api/phrases/emergency` | Get emergency phrases |
| POST | `/api/phrases/:id/generate-audio` | Generate TTS for phrase |

### Voice Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/voice/profile` | Get company voice profile |
| PUT | `/api/voice/profile/accent` | Update accent selection |
| POST | `/api/voice/samples` | Upload voice sample |
| GET | `/api/voice/samples` | List voice samples |
| DELETE | `/api/voice/samples/:id` | Delete voice sample |
| POST | `/api/voice/clone` | Start voice cloning job |
| GET | `/api/voice/clone/status` | Get cloning job status |

### Content Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content` | List content (paginated) |
| POST | `/api/content` | Upload content |
| GET | `/api/content/:id` | Get content details |
| PUT | `/api/content/:id` | Update content |
| DELETE | `/api/content/:id` | Delete content |
| GET | `/api/content/analytics` | Content analytics |

### Training (Employee)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/training/topics` | Get assigned topics |
| GET | `/api/training/phrases/:topicId` | Get phrases for training |
| POST | `/api/training/sessions` | Start training session |
| PUT | `/api/training/sessions/:id` | Update session (add attempts) |
| POST | `/api/training/sessions/:id/complete` | Complete session |
| GET | `/api/training/progress` | Get own progress |
| GET | `/api/training/stats` | Get own stats |

### TTS / Speech
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/speech/tts` | Generate TTS audio |
| POST | `/api/speech/analyze` | Analyze pronunciation (compare) |

### AI / ChatGPT
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/extract-company-info` | Extract info from URL/PDF |
| POST | `/api/ai/pronunciation-feedback` | Get pronunciation feedback |
| POST | `/api/ai/conversation` | Free Talk conversation |
| POST | `/api/ai/generate-phrases` | Generate training phrases |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/roles` | List roles |
| PUT | `/api/settings/password-policy` | Update password policy |
| GET | `/api/settings/billing` | Get billing info |
| GET | `/api/settings/invoices` | List invoices |

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

---

## External Service Integration Patterns

### Fish Audio Service
```javascript
// services/fishAudio.service.js

class FishAudioService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.fish.audio';
  }

  // Generate TTS audio
  async textToSpeech(text, voiceId, options = {}) {
    // POST /v1/tts
    // Returns: audio buffer or URL
  }

  // Upload sample for cloning
  async uploadVoiceSample(audioBuffer, metadata) {
    // POST /v1/voice/samples
  }

  // Start voice cloning
  async cloneVoice(sampleIds, options) {
    // POST /v1/voice/clone
    // Returns: job ID
  }

  // Check cloning status
  async getCloneStatus(jobId) {
    // GET /v1/voice/clone/{jobId}
  }

  // Get available voices
  async listVoices() {
    // GET /v1/voices
  }
}
```

### OpenAI Service
```javascript
// services/openai.service.js

class OpenAIService {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
    this.model = 'gpt-4o-mini';
  }

  // Extract company info from text/URL
  async extractCompanyInfo(content, type) {
    // System prompt for structured extraction
    // Returns: { name, industry, address, introduction }
  }

  // Generate pronunciation feedback
  async getPronunciationFeedback(expected, actual, context) {
    // Compare and provide helpful feedback
    // Returns: { score, feedback, suggestions }
  }

  // Free Talk conversation
  async chat(messages, companyContext) {
    // Maintains conversation context
    // Returns: { response, audioText }
  }

  // Generate training phrases
  async generatePhrases(topic, difficulty, count) {
    // Generate contextual phrases
    // Returns: [{ japanese, romaji, english, context }]
  }
}
```

### Job Queue (Voice Cloning)
```javascript
// jobs/voiceCloning.job.js

// Bull queue for async processing
const voiceCloningQueue = new Bull('voice-cloning', redisConfig);

voiceCloningQueue.process(async (job) => {
  const { companyId, sampleIds } = job.data;
  
  // 1. Start cloning with Fish Audio
  // 2. Poll for status
  // 3. Update company voice profile
  // 4. Generate sample audio for verification
});
```

---

## WebSocket Events (Free Talk Mode)

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_session` | `{ sessionId }` | Join training session |
| `user_message` | `{ text, audioBlob }` | Send user message |
| `typing` | `{}` | User is typing/speaking |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `session_joined` | `{ session }` | Confirmation |
| `ai_response` | `{ text, audioUrl }` | AI reply with TTS |
| `ai_typing` | `{}` | AI is generating |
| `error` | `{ message }` | Error occurred |

---

## Folder Structure

```
japanese-coch/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   ├── redis.js
│   │   │   └── env.js
│   │   ├── models/
│   │   │   ├── Company.js
│   │   │   ├── User.js
│   │   │   ├── Topic.js
│   │   │   ├── Phrase.js
│   │   │   ├── TrainingSession.js
│   │   │   ├── VoiceSample.js
│   │   │   ├── Content.js
│   │   │   └── AuditLog.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── company.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── topic.routes.js
│   │   │   ├── phrase.routes.js
│   │   │   ├── voice.routes.js
│   │   │   ├── content.routes.js
│   │   │   ├── training.routes.js
│   │   │   ├── speech.routes.js
│   │   │   ├── ai.routes.js
│   │   │   └── settings.routes.js
│   │   ├── controllers/
│   │   │   └── [matching controllers]
│   │   ├── services/
│   │   │   ├── fishAudio.service.js
│   │   │   ├── openai.service.js
│   │   │   ├── email.service.js
│   │   │   └── storage.service.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   ├── validation.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── jobs/
│   │   │   └── voiceCloning.job.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   ├── password.js
│   │   │   └── response.js
│   │   ├── validators/
│   │   │   └── [Joi/Zod schemas]
│   │   ├── socket/
│   │   │   └── training.socket.js
│   │   └── app.js
│   ├── uploads/
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── training/
│   │   │   └── admin/
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Employees.jsx
│   │   │   ├── VoiceManagement.jsx
│   │   │   ├── ContentManagement.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Training.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSpeechRecognition.js
│   │   │   └── useSocket.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── store/
│   │   │   └── [Zustand stores]
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── wireframes/
├── ARCHITECTURE.md
└── README.md
```

---

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/wago

# Redis (for Bull queues)
REDIS_URL=redis://localhost:6379

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Fish Audio
FISH_AUDIO_API_KEY=your-fish-audio-key
FISH_AUDIO_BASE_URL=https://api.fish.audio

# OpenAI
OPENAI_API_KEY=your-openai-key

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

---

## Next Steps

1. **Backend Implementation** - Models, routes, controllers, services
2. **Frontend Implementation** - React components with /ui workflow
3. **Integration Testing** - Fish Audio + OpenAI integration
4. **Seed Data** - Starter phrases and topics
