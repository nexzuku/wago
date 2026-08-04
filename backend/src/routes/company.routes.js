import { Router } from 'express';
import multer from 'multer';
import * as companyController from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin, requireManager } from '../middleware/role.middleware.js';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max for logos
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images are allowed.'));
    }
  }
});

router.use(authenticate);

router.get('/current', companyController.getCurrentCompany);
router.put('/current', requireAdmin, companyController.updateCompany);
router.put('/current/branding', requireAdmin, upload.single('logo'), companyController.updateBranding);
router.put('/current/sso', requireAdmin, companyController.updateSSO);
router.get('/current/stats', requireManager, companyController.getStats);

export default router;
