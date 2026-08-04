import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { errorResponse, ErrorCodes } from '../utils/response.js';

const handler = (message) => (req, res) =>
  errorResponse(res, message, ErrorCodes.RATE_LIMIT, null, 429);

const base = {
  standardHeaders: true,
  legacyHeaders: false,
  // Don't rate-limit during local development or tests
  skip: () => process.env.NODE_ENV === 'test'
};

/**
 * Credential endpoints — the only real defence against password guessing,
 * since there is no account lockout. Counts failures only, so a user with the
 * right password is never blocked by someone else's typos from the same IP.
 */
export const authLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  handler: handler('Too many failed attempts. Please try again in a few minutes.')
});

/**
 * Password-reset requests — throttled separately because each one sends an
 * email, so abuse costs deliverability reputation rather than just CPU.
 */
export const passwordResetLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  handler: handler('Too many password reset requests. Please try again later.')
});

/**
 * AI endpoints — every call costs real money at the provider. Keyed by user
 * when authenticated so one tenant cannot exhaust another's budget, falling
 * back to IP for the unauthenticated onboarding extraction route.
 */
export const aiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 20,
  // ipKeyGenerator takes the IP *string* and normalises IPv6 to its /56 subnet —
  // a raw req.ip would let one client cycle addresses in its own prefix to evade
  // the limit. (Passing `req` here instead silently disables limiting entirely,
  // because every request object is a distinct key.)
  keyGenerator: (req) => (req.user?._id ? `user:${req.user._id}` : ipKeyGenerator(req.ip)),
  handler: handler('Too many AI requests. Please slow down and try again shortly.')
});

/**
 * Unauthenticated onboarding extraction (URL scrape / PDF upload) — stricter,
 * because anyone on the internet can reach it and each call does outbound
 * network I/O plus an LLM round trip.
 */
export const publicExtractionLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 15,
  handler: handler('Too many extraction requests. Please try again in a few minutes.')
});
