import { Router } from 'express';
import * as phraseController from '../controllers/phrase.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/emergency', phraseController.getEmergencyPhrases);
router.post('/topic/:topicId/pregenerate-audio', requireManager, phraseController.batchGenerateTopicAudio);
router.put('/:id', requireManager, phraseController.updatePhrase);
router.delete('/:id', requireManager, phraseController.deletePhrase);
router.post('/:id/generate-audio', requireManager, phraseController.generatePhraseAudio);

export default router;
