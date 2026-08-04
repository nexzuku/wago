import { Router } from 'express';
import * as cultureController from '../controllers/culture.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

// Employee: get culture content for training
router.get('/training', cultureController.getCultureForTraining);

// Admin/Manager: CRUD
router.get('/', requireManager, cultureController.listCultureContent);
router.post('/', requireManager, cultureController.createCultureContent);
router.put('/:id', requireManager, cultureController.updateCultureContent);
router.delete('/:id', requireManager, cultureController.deleteCultureContent);

export default router;
