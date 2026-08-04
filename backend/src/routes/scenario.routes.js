import { Router } from 'express';
import * as scenarioController from '../controllers/scenario.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

// Employee: get scenarios with progress
router.get('/training', scenarioController.getScenariosForTraining);

// Admin/Manager: CRUD
router.get('/', requireManager, scenarioController.listScenarios);
router.post('/', requireManager, scenarioController.createScenario);
router.put('/:id', requireManager, scenarioController.updateScenario);
router.delete('/:id', requireManager, scenarioController.deleteScenario);

export default router;
