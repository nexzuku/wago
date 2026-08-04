import { Router } from 'express';
import multer from 'multer';
import * as contentController from '../controllers/content.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireManager } from '../middleware/role.middleware.js';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max
});

router.use(authenticate);

router.get('/', contentController.listContent);
router.post('/', requireManager, upload.single('file'), contentController.uploadContent);
router.post('/detect-topics', requireManager, upload.single('file'), contentController.detectTopics);
router.get('/analytics', requireManager, contentController.getContentAnalytics);
router.get('/:id', contentController.getContent);
router.put('/:id', requireManager, contentController.updateContent);
router.delete('/:id', requireManager, contentController.deleteContent);

export default router;
