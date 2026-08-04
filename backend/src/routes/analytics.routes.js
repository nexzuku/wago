import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);
router.use(requireManager);

router.get('/company', analyticsController.getCompanyAnalytics);
router.get('/audio-metrics', analyticsController.getCompanyAudioMetrics);

export default router;
