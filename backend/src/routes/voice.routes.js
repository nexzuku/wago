import { Router } from 'express';
import multer from 'multer';
import * as voiceController from '../controllers/voice.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/webm', 'audio/wave', 'audio/x-wav'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only audio files are allowed.'));
  }
});

router.use(authenticate);

// Profile & accent
router.get('/profile', voiceController.getVoiceProfile);
router.put('/profile/accent', requireAdmin, voiceController.updateAccent);

// Voice samples (raw uploads)
router.post('/samples', requireAdmin, upload.single('audio'), voiceController.uploadVoiceSample);
router.get('/samples', voiceController.listVoiceSamples);
router.delete('/samples/:id', requireAdmin, voiceController.deleteVoiceSample);

// Voice clones (DeepInfra / Chatterbox Multilingual)
router.post('/clones', requireAdmin, upload.single('audio'), voiceController.createVoiceClone);
router.get('/clones', voiceController.listVoiceClones);
router.put('/clones/:id/default', requireAdmin, voiceController.setDefaultVoiceClone);
router.delete('/clones/:id', requireAdmin, voiceController.deleteVoiceClone);

// Per-employee voice assignment
router.put('/clones/assign/:userId', requireAdmin, voiceController.assignVoiceToEmployee);

export default router;
