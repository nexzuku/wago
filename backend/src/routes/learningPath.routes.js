import { Router } from 'express';
import * as learningPathController from '../controllers/learningPath.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

// Employee: get paths with progress
router.get('/training', learningPathController.getPathsForTraining);

// Admin/Manager: CRUD
router.get('/', requireManager, learningPathController.listLearningPaths);
router.post('/', requireManager, learningPathController.createLearningPath);
router.put('/:id', requireManager, learningPathController.updateLearningPath);
router.delete('/:id', requireManager, learningPathController.deleteLearningPath);

export default router;
