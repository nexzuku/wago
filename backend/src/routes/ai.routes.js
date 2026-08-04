import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/role.middleware.js';
import { aiLimiter, publicExtractionLimiter } from '../middleware/rateLimit.middleware.js';
import multer from 'multer';

const router = Router();

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Company info extraction doesn't require auth (used in onboarding) — so it
// carries the strictest limit: it is internet-reachable and costs money per call
router.post('/extract-company-info', publicExtractionLimiter, optionalAuth, aiController.extractCompanyInfo);
router.post('/extract-from-pdf', publicExtractionLimiter, optionalAuth, upload.single('document'), aiController.extractFromPDF);

// These require authentication (aiLimiter keys off the user once authenticated)
router.post('/pronunciation-feedback', authenticate, aiLimiter, aiController.getPronunciationFeedback);
router.post('/conversation', authenticate, aiLimiter, aiController.conversation);
router.post('/generate-phrases', authenticate, requireManager, aiLimiter, aiController.generatePhrases);

export default router;
