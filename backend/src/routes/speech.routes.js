import { Router } from 'express';
import multer from 'multer';
import * as speechController from '../controllers/speech.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['audio/wav', 'audio/wave', 'audio/x-wav'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only WAV audio is allowed.'));
  }
});

router.use(authenticate);

router.post('/tts', speechController.textToSpeech);
router.post('/metrics', upload.single('audio'), speechController.analyzeAudioMetrics);
router.post('/analyze', speechController.analyzePronunciation);

export default router;
