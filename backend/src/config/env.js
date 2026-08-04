import dotenv from 'dotenv';
dotenv.config();

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wago'
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d'
  },
  
  fishAudio: {
    apiKey: process.env.FISH_AUDIO_API_KEY,
    baseUrl: process.env.FISH_AUDIO_BASE_URL || 'https://api.fish.audio'
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY
  },

  deepinfra: {
    apiKey: process.env.DEEPINFRA_API_KEY
  },

  openSmile: {
    enabled: process.env.OPENSMILE_ENABLED === 'true',
    binaryPath: process.env.OPENSMILE_PATH || '',
    configPath: process.env.OPENSMILE_CONFIG || ''
  },
  
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromName: process.env.SMTP_FROM_NAME || 'WaGo Training'
  },
  
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};
