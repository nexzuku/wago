import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  refreshTokenValidator
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', refreshTokenValidator, validate, authController.refreshToken);
router.post('/forgot-password', forgotPasswordValidator, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validate, authController.resetPassword);
router.get('/me', authenticate, authController.getMe);

export default router;
