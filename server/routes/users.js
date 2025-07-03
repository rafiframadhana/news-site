import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  deleteUser,
  getDashboardStats,
  getAuthors
} from '../controllers/userController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('role')
    .optional()
    .isIn(['author', 'admin'])
    .withMessage('Role must be either author or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
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

// Public routes
router.get('/authors', getAuthors);
router.get('/username/:username', getUserByUsername);

// Protected routes
router.get('/dashboard/stats', authenticateToken, getDashboardStats);
router.get('/:id', authenticateToken, getUserById);

// Admin only routes
router.get('/', authenticateToken, requireAdmin, getAllUsers);
router.put('/:id', authenticateToken, requireAdmin, updateUserValidation, handleValidationErrors, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, deleteUser);

export default router;
