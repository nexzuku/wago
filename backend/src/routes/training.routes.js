import { Router } from 'express';
import * as trainingController from '../controllers/training.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/topics', trainingController.getAssignedTopics);
router.get('/phrases/:topicId', trainingController.getTrainingPhrases);
router.post('/sessions', trainingController.startSession);
router.put('/sessions/:id', trainingController.updateSession);
router.post('/sessions/:id/complete', trainingController.completeSession);
router.get('/progress', trainingController.getProgress);
router.get('/stats', trainingController.getStats);
router.get('/audio-metrics', trainingController.getAudioMetrics);
router.get('/leaderboard', trainingController.getLeaderboard);

// Daily goals
router.get('/daily-goals', trainingController.getDailyGoals);
router.put('/daily-goals', trainingController.updateDailyGoalTargets);

// Saved / Favorite phrases
router.get('/saved-phrases', trainingController.getSavedPhrases);
router.get('/saved-phrase-ids', trainingController.getSavedPhraseIds);
router.post('/saved-phrases/toggle', trainingController.toggleSavePhrase);

// Pronunciation history
router.get('/pronunciation-history', trainingController.getPronunciationHistory);

// Badges
router.get('/badges', trainingController.getBadgeDefinitions);
router.get('/badges/earned', trainingController.getUserBadges);

export default router;
