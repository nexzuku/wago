# WaGo - Enterprise Japanese Training Platform

AI-powered Japanese language training platform for international workforce, featuring voice cloning, speech recognition, and personalized learning experiences.

## Features

### For Companies (Admin/Manager)
- **Dashboard** - KPIs, analytics, activity charts, top performers
- **Employee Management** - Add/bulk import employees, assign topics, track progress
- **Voice Management** - Upload voice samples, clone company voice with Fish Audio
- **Content Management** - Upload training materials, organize by topics
- **Settings** - Company profile, branding, security, billing

### For Employees
- **Training Modes**
  - Listen & Repeat - Hear phrases and practice pronunciation
  - Test Yourself - Practice without hints
  - Free Talk - AI conversation partner
- **Speech Recognition** - Browser-based Japanese speech-to-text
- **Progress Tracking** - Skills breakdown, streaks, stars, badges
- **Emergency Phrases** - Quick access to critical safety phrases

## Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (access + refresh tokens)
- **Real-time**: Socket.io
- **File Storage**: Local uploads (S3-ready)

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **State**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts

### External Services
- **Fish Audio API** - Text-to-Speech & Voice Cloning
- **OpenAI API** - Content analysis, pronunciation feedback, conversation AI
- **Web Speech API** - Browser speech recognition

## Project Structure

```
japanese-coch/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment & database config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   ├── services/        # External API integrations
│   │   ├── utils/           # JWT, response helpers
│   │   ├── validators/      # Request validation
│   │   ├── seeds/           # Database seeding
│   │   └── app.js           # Express app entry
│   ├── uploads/             # File storage
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Auth layout
│   │   │   ├── dashboard/   # Admin layout
│   │   │   └── training/    # Training layout
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API client
│   │   ├── store/           # Zustand stores
│   │   └── styles/          # Global CSS
│   └── package.json
│
├── wireframes/              # UI wireframes
├── ARCHITECTURE.md          # Detailed architecture docs
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional, for job queues)

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# - MONGODB_URI
# - FISH_AUDIO_API_KEY
# - OPENAI_API_KEY
# - JWT secrets

# Seed database with starter topics/phrases
npm run seed

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Company registration |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List employees |
| POST | `/api/users` | Create employee |
| POST | `/api/users/bulk` | Bulk create |
| PUT | `/api/users/:id` | Update employee |

### Topics & Phrases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/topics` | List topics |
| POST | `/api/topics` | Create topic |
| GET | `/api/topics/:id/phrases` | Get phrases |

### Training
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/training/topics` | Get assigned topics |
| POST | `/api/training/sessions` | Start session |
| POST | `/api/training/sessions/:id/complete` | Complete session |

### Voice
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/voice/profile` | Get voice profile |
| POST | `/api/voice/samples` | Upload sample |
| POST | `/api/voice/clone` | Start cloning |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/pronunciation-feedback` | Get pronunciation feedback |
| POST | `/api/ai/conversation` | Free talk AI |
| POST | `/api/ai/generate-phrases` | Generate phrases |

## Environment Variables

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/wago

# JWT
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Fish Audio
FISH_AUDIO_API_KEY=your-fish-audio-key

# OpenAI
OPENAI_API_KEY=your-openai-key

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full access, company settings, billing |
| **Manager** | Employee management, content management |
| **Employee** | Training only |

## Database Models

- **Company** - Organization profile, branding, voice settings
- **User** - Employees with roles and progress
- **Topic** - Training categories
- **Phrase** - Japanese phrases with translations
- **TrainingSession** - Learning sessions with attempts
- **VoiceSample** - Audio files for cloning
- **Content** - Training materials
- **AuditLog** - Activity tracking

## Design System

### Colors
- **Primary**: Indigo (#6366f1)
- **Sakura**: Pink accent (#FFB7C5)
- **Jade**: Success green (#00A86B)
- **Gold**: Warning/accent (#D4AF37)
- **Dark**: Background shades (#0f172a - #1e293b)

### Typography
- **Display**: Clash Display
- **Body**: Satoshi
- **Japanese**: Noto Sans JP

## License

MIT License - See LICENSE file for details.

---

Built with ❤️ for enterprise Japanese language training.
