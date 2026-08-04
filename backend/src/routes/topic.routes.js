import { Router } from 'express';
import * as topicController from '../controllers/topic.controller.js';
import * as phraseController from '../controllers/phrase.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/role.middleware.js';

const router = Router();

// Topics
router.get('/', optionalAuth, topicController.listTopics);
router.post('/', authenticate, requireManager, topicController.createTopic);
router.get('/:id', authenticate, topicController.getTopic);
router.put('/:id', authenticate, requireManager, topicController.updateTopic);
router.delete('/:id', authenticate, requireManager, topicController.deleteTopic);

// AI phrase generation for a topic
router.post('/:id/generate-phrases', authenticate, requireManager, topicController.generateTopicPhrases);

// Phrase CRUD within a topic (admin)
router.post('/:id/phrases', authenticate, requireManager, topicController.createPhrase);
router.put('/:id/phrases/:phraseId', authenticate, requireManager, topicController.updatePhrase);
router.delete('/:id/phrases/:phraseId', authenticate, requireManager, topicController.deletePhrase);

// Bulk import phrases (CSV)
router.post('/:id/phrases/bulk', authenticate, requireManager, topicController.bulkImportPhrases);

// Phrases within topics (existing - for listing)
router.get('/:topicId/phrases', authenticate, phraseController.listPhrases);

export default router;
