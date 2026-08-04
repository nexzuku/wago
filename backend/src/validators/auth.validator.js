import { body } from 'express-validator';

export const registerValidator = [
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Company name must be 2-100 characters'),
  
  body('industry')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Industry must be less than 50 characters'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Address must be less than 200 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('First name must be less than 50 characters'),
  
  body('lastName')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Last name must be less than 50 characters'),
  
  body('selectedTopics')
    .optional()
    .isArray().withMessage('Selected topics must be an array'),
  
  body('voiceAccent')
    .optional()
    .isIn(['tokyo', 'kansai', 'kyushu', 'neutral']).withMessage('Invalid accent')
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

export const forgotPasswordValidator = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
];

export const resetPasswordValidator = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

export const refreshTokenValidator = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token is required')
];
