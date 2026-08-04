import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/env.js';
import connectDB from './config/database.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';
import deepinfraService from './services/deepinfra.service.js';
import { analyzeAudioBuffer } from './services/audioAnalysis.service.js';
import { verifyAccessToken } from './utils/jwt.js';
import { User, TrainingSession, Topic } from './models/index.js';
import emailService from './services/email.service.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import companyRoutes from './routes/company.routes.js';
import topicRoutes from './routes/topic.routes.js';
import phraseRoutes from './routes/phrase.routes.js';
import voiceRoutes from './routes/voice.routes.js';
import contentRoutes from './routes/content.routes.js';
import trainingRoutes from './routes/training.routes.js';
import speechRoutes from './routes/speech.routes.js';
import aiRoutes from './routes/ai.routes.js';
import cultureRoutes from './routes/culture.routes.js';
import learningPathRoutes from './routes/learningPath.routes.js';
import scenarioRoutes from './routes/scenario.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isJapaneseLang = (lang) => {
  const l = String(lang || '').trim().toLowerCase();
  return l === 'ja' || l.startsWith('ja-') || l === 'jp' || l === 'jpn' || l === 'japanese';
};

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST']
  },
  // Allow sending base64 WAV blobs over sockets (default is ~1MB and can drop events)
  maxHttpBufferSize: 20 * 1024 * 1024
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // Allow playing audio from Blob URLs created in the browser (Object URLs)
  // Otherwise Helmet's default CSP falls back to default-src 'self' and blocks blob:
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'media-src': ["'self'", 'blob:', 'data:'],
      // Some browsers treat blob: usage via <audio> / decoding pipelines as requiring these too
      'worker-src': ["'self'", 'blob:'],
      'img-src': ["'self'", 'blob:', 'data:']
    }
  }
}));
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend from public directory
const publicDir = path.join(__dirname, '../public');
app.use(express.static(publicDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/phrases', phraseRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/training', trainingRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/culture', cultureRoutes);
app.use('/api/learning-paths', learningPathRoutes);
app.use('/api/scenarios', scenarioRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check — must be before the SPA wildcard
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback (serve index.html for non-API routes)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Socket.io events for real-time training
// Socket auth middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    const decoded = verifyAccessToken(token);
    if (!decoded) return next(new Error('Invalid token'));
    const user = await User.findById(decoded.userId).populate('companyId');
    if (!user || user.status !== 'active') return next(new Error('User not found'));
    socket.user = user;
    socket.companyId = user.companyId._id;
    socket.company = user.companyId;
    next();
  } catch (err) {
    next(new Error('Authentication failed'));
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id} (${socket.user.email})`);

  // Join a training session room
  socket.on('join_session', async ({ sessionId }) => {
    socket.join(`session:${sessionId}`);
    socket.sessionId = sessionId;
    socket.emit('session_joined', { sessionId });
  });

  // Real-time pronunciation feedback
  socket.on('pronunciation_attempt', async ({ requestId, sessionId, phraseId, expected, actual, romaji, english, topicId, audioData, audioMime }) => {
    try {
      socket.emit('feedback_processing', { requestId });
      // Yield to the event loop so the socket flush is sent before heavy async work begins
      await new Promise(resolve => setImmediate(resolve));

      let topicContext = {};
      if (topicId) {
        try {
          const topic = await Topic.findById(topicId).lean();
          if (topic) topicContext = { topicName: topic.name, backgroundContext: topic.backgroundContext || '', aiInstructions: topic.aiInstructions || '' };
        } catch (e) { /* ignore */ }
      }

      let audioMetrics = null;
      if (audioData) {
        try {
          // audioData is raw base64 (no data: prefix). Expect WAV PCM from frontend recorder.
          const audioBuffer = Buffer.from(audioData, 'base64');
          const analysis = await analyzeAudioBuffer({ buffer: audioBuffer, expectedText: expected, actualText: actual, responseLatencyMs: null });
          audioMetrics = {
            durationSec: analysis.durationSec,
            energyScore: analysis.energy?.score,
            timingScore: analysis.timing?.score,
            stabilityScore: analysis.stability?.score,
            articulationScore: analysis.articulation?.score,
            accuracyScore: analysis.accuracy?.score,
            emotion: analysis.emotion
          };
        } catch (e) {
          console.warn('Audio analysis failed (pronunciation_attempt):', e.message);
        }
      }

      const feedback = await deepinfraService.getPronunciationFeedback(expected, actual, {
        romaji,
        english,
        audioMime,
        audioMetrics,
        ...topicContext
      });
      const voiceId = deepinfraService.resolveVoiceId(socket.user, socket.company);

      // Push score immediately — frontend shows result without waiting for audio
      socket.emit('pronunciation_feedback', {
        requestId,
        score: feedback.score,
        suggestions: feedback.suggestions || [],
        totalSegments: (feedback.segments || []).length,
        expected,
        actual
      });

      // Fire TTS for each segment independently — push as each completes (no waiting for all)
      (feedback.segments || []).forEach((seg, i) => {
        (async () => {
          try {
            // Japanese uses company/user voice clone; English uses default voice
            const segVoiceId = isJapaneseLang(seg.lang) ? voiceId : null;
            const { buffer, mimeType } = await deepinfraService.textToSpeech(seg.text, seg.lang, segVoiceId);
            socket.emit('ai_segment', {
              index: i, text: seg.text, lang: seg.lang, context: 'feedback',
              audioData: buffer.toString('base64'), audioMime: mimeType,
              requestId
            });
          } catch {
            socket.emit('ai_segment', { index: i, text: seg.text, lang: seg.lang, context: 'feedback', audioData: null, requestId });
          }
        })();
      });

      // Session update — fire and forget
      if (sessionId && sessionId !== 'demo') {
        TrainingSession.findByIdAndUpdate(sessionId, {
          $push: { attempts: { phraseId, userTranscript: actual, score: feedback.score, feedback: (feedback.segments?.[0]?.text || ''), attemptedAt: new Date() } }
        }).catch(e => console.error('Session update error:', e.message));
      }
    } catch (error) {
      console.error('Pronunciation feedback error:', error.message);
      const expectedChars = [...expected];
      const actualChars = [...actual];
      let matches = 0;
      expectedChars.forEach((ch, i) => { if (actualChars[i] === ch) matches++; });
      const score = Math.max(20, Math.round((matches / Math.max(expectedChars.length, 1)) * 100));
      const fallbackText = score >= 80 ? 'Good pronunciation!' : score >= 50 ? 'Keep practicing!' : 'Try again slowly.';
      socket.emit('pronunciation_feedback', { requestId, score, suggestions: [], totalSegments: 1, expected, actual });
      socket.emit('ai_segment', { requestId, index: 0, text: fallbackText, lang: 'en', context: 'feedback', audioData: null });
    }
  });

  // Free Talk conversation
  socket.on('free_talk_message', async ({ requestId, sessionId, text, conversationHistory, topicId, conversationStarter, audioData }) => {
    try {
      socket.emit('ai_typing', { requestId });

      const messages = (conversationHistory || []).map(m => ({
        role: m.role,
        content: m.content
      }));
      messages.push({ role: 'user', content: text });

      // Build topic-aware context
      const aiContext = {
        industry: socket.company?.industry,
        companyName: socket.company?.name
      };

      if (topicId) {
        try {
          const topic = await Topic.findById(topicId).lean();
          if (topic) {
            aiContext.topicName = topic.name;
            aiContext.backgroundContext = topic.backgroundContext || '';
            aiContext.aiInstructions = topic.aiInstructions || '';
            aiContext.vocabularyList = topic.vocabularyList || [];
            if (conversationStarter) aiContext.conversationStarter = conversationStarter;
          }
        } catch (e) { /* ignore topic load errors */ }
      }

      // Streaming pipeline: LLM yields segments as they complete → TTS fires immediately per segment
      // (Optional) we currently don't feed audio to the LLM here, but we still accept it
      // to support future multimodal analysis.
      if (audioData) {
        // Best-effort decode to ensure payload isn't malformed; avoid heavy analysis in free talk
        try { Buffer.from(audioData, 'base64'); } catch { /* ignore */ }
      }

      const voiceId = deepinfraService.resolveVoiceId(socket.user, socket.company);
      let segIndex = 0;
      let correction = null;
      const jaTexts = [];

      for await (const seg of deepinfraService.streamFreeTalkConversation(messages, aiContext)) {
        if ('correction' in seg) { correction = seg.correction; continue; }
        const idx = segIndex++;
        if (isJapaneseLang(seg.lang)) jaTexts.push(seg.text);

        // Fire TTS immediately (non-blocking IIFE) — pushes ai_segment when audio is ready
        (async (segment, index) => {
          try {
            // Japanese uses company/user voice clone; English uses default voice
            const segVoiceId = isJapaneseLang(segment.lang) ? voiceId : null;
            const { buffer, mimeType } = await deepinfraService.textToSpeech(segment.text, segment.lang, segVoiceId);
            socket.emit('ai_segment', {
              index, text: segment.text, lang: segment.lang, context: 'free_talk',
              audioData: buffer.toString('base64'), audioMime: mimeType,
              requestId
            });
          } catch {
            socket.emit('ai_segment', { index, text: segment.text, lang: segment.lang, context: 'free_talk', audioData: null, requestId });
          }
        })(seg, idx);
      }

      socket.emit('ai_response_end', { requestId, totalSegments: segIndex, correction });

      // Session save — fire and forget
      if (sessionId && sessionId !== 'demo') {
        TrainingSession.findByIdAndUpdate(sessionId, {
          $push: {
            conversation: [
              { role: 'user', content: text, timestamp: new Date() },
              { role: 'assistant', content: jaTexts.join(' '), timestamp: new Date() }
            ]
          }
        }).catch(e => console.error('Session update error:', e.message));
      }
    } catch (error) {
      console.error('Free talk error:', error.message);
      socket.emit('ai_segment', { index: 0, text: 'すみません、もう一度お願いします。', lang: 'ja', context: 'free_talk', audioData: null, requestId });
      socket.emit('ai_segment', { index: 1, text: 'Sorry, please try again.', lang: 'en', context: 'free_talk', audioData: null, requestId });
      socket.emit('ai_response_end', { requestId, totalSegments: 2, correction: null });
    }
  });

  // Generate TTS for a phrase on demand — base64 direct, no file I/O
  // Works with or without a configured voice clone (falls back to default model voice)
  socket.on('request_tts', async ({ requestId, text, phraseId, language = 'ja' }) => {
    try {
      const voiceId = deepinfraService.resolveVoiceId(socket.user, socket.company);
      const useVoiceId = isJapaneseLang(language) ? voiceId : null;
      const { buffer, mimeType } = await deepinfraService.textToSpeech(text, language, useVoiceId);
      socket.emit('tts_audio', { requestId, audioData: buffer.toString('base64'), audioMime: mimeType, text, phraseId, language });
    } catch (error) {
      console.error('TTS request error:', error.message);
      socket.emit('tts_error', { requestId, message: 'Failed to generate audio' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Verify SMTP connection (non-blocking)
    emailService.verify().then(ok => {
      if (ok) console.log('📧 Email service: connected');
      else console.warn('⚠️  Email service: SMTP verification failed — emails may not send');
    });

    httpServer.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
      console.log(`🔗 API: http://localhost:${config.port}/api`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { app, io };
