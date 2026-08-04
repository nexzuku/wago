import dotenv from 'dotenv';
dotenv.config();

// Browsers send `Origin` without a trailing slash, so a configured value like
// "https://app.example.com/" would never match. Normalise and allow a
// comma-separated list so one deployment can serve several front-ends.
const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map(o => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const configuredOrigins = parseOrigins(process.env.FRONTEND_URL);
const devOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = [
  ...new Set([
    ...configuredOrigins,
    // Keep local dev working even when FRONTEND_URL points at production
    ...(isProduction ? [] : devOrigins)
  ])
];

// Falling back to a hardcoded signing key in production would let anyone forge
// an admin token using a value that is public in this repo. Refuse to boot.
const requireInProduction = (name, value, devFallback) => {
  if (value) return value;
  if (isProduction) {
    console.error(`\n❌ ${name} is not set. Refusing to start in production —`);
    console.error('   a default signing secret would make every auth token forgeable.\n');
    process.exit(1);
  }
  return devFallback;
};

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wago'
  },
  
  jwt: {
    accessSecret: requireInProduction('JWT_ACCESS_SECRET', process.env.JWT_ACCESS_SECRET, 'dev-access-secret'),
    refreshSecret: requireInProduction('JWT_REFRESH_SECRET', process.env.JWT_REFRESH_SECRET, 'dev-refresh-secret'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d'
  },
  
  // DeepInfra is the only AI provider actually wired up; the Fish Audio,
  // OpenAI and Gemini integrations were removed as dead code.
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
  
  frontendUrl: configuredOrigins[0] || 'http://localhost:5173',
  allowedOrigins: allowedOrigins.length > 0 ? allowedOrigins : devOrigins
};
