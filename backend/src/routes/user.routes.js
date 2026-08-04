import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', requireManager, userController.listUsers);
router.post('/', requireManager, userController.createUser);
router.post('/bulk', requireManager, userController.bulkCreateUsers);
router.get('/:id', requireManager, userController.getUser);
router.put('/:id', requireManager, userController.updateUser);
router.delete('/:id', requireManager, userController.deleteUser);
router.post('/:id/reinvite', requireManager, userController.reinviteUser);
router.put('/:id/topics', requireManager, userController.assignTopics);
router.get('/:id/progress', requireManager, userController.getUserProgress);

export default router;
