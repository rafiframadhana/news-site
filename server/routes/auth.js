import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateProfile,
  verifyToken
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { 
  handleValidationErrors, 
  validateEmail, 
  validateEmailExistence 
} from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email format')
    .normalizeEmail()
    .custom(async (email) => {
      // First perform basic validation
      const basicResult = validateEmail(email);
      if (!basicResult.isValid) {
        throw new Error(basicResult.message);
      }
      
      // Then verify email existence using external API
      // Only in production to avoid API rate limits during development
      if (process.env.NODE_ENV === 'production' || process.env.VERIFY_EMAIL_EXISTENCE === 'true') {
        try {
          const apiResult = await validateEmailExistence(email, {
            allowDisposable: false,
            minQualityScore: 0.5
          });
          
          if (!apiResult.isValid) {
            throw new Error(apiResult.message);
          }
        } catch (error) {
          // If API validation fails, log but don't block registration
          console.warn(`Email API validation error: ${error.message}`);
        }
      }
      
      return true;
    }),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  body('role')
    .optional()
    .isIn(['author', 'admin'])
    .withMessage('Role must be either author or admin')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
    .custom(async (email) => {
      // For login, we only verify the format but not disposable email check
      // since the user might have already registered with a disposable email
      const emailRegex = /^[\w+\-.]+@[a-z\d\-.]+\.[a-z]+$/i;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email format');
      }
      return true;
    }),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
];

// Routes
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfileValidation, handleValidationErrors, updateProfile);
router.get('/verify', authenticateToken, verifyToken);

export default router;
