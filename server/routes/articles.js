import express from 'express';
import { body } from 'express-validator';
import {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  addComment,
  toggleLike,
  getArticlesByAuthor,
  getCategories
} from '../controllers/articleController.js';
import { authenticateToken, optionalAuth, requireAuthor } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

// Validation rules
const articleValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .notEmpty()
    .withMessage('Content is required'),
  body('featuredImage')
    .optional()
    .custom((value) => {
      if (!value) return true; // Optional field
      
      // Allow localhost URLs in development
      if (process.env.NODE_ENV === 'development' && value.includes('localhost')) {
        return true;
      }
      
      // Validate as URL for production
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(value)) {
        throw new Error('Featured image must be a valid URL');
      }
      
      return true;
    })
    .withMessage('Featured image must be a valid URL'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['politics', 'business', 'technology', 'sports', 'entertainment', 'health', 'science', 'world', 'local', 'opinion'])
    .withMessage('Invalid category'),
  body('excerpt')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Excerpt cannot exceed 300 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status'),
  body('seoTitle')
    .optional()
    .isLength({ max: 60 })
    .withMessage('SEO title cannot exceed 60 characters'),
  body('seoDescription')
    .optional()
    .isLength({ max: 160 })
    .withMessage('SEO description cannot exceed 160 characters')
];

const commentValidation = [
  body('comment')
    .notEmpty()
    .withMessage('Comment is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters')
];

// Public routes
router.get('/', optionalAuth, getArticles);
router.get('/author/:authorId', getArticlesByAuthor);
router.get('/id/:id', optionalAuth, getArticleBySlug); // Add optionalAuth to allow access to drafts for authors
router.get('/:slug', optionalAuth, getArticleBySlug);

// Protected routes
router.post('/', authenticateToken, requireAuthor, articleValidation, handleValidationErrors, createArticle);
router.put('/:id', authenticateToken, requireAuthor, articleValidation, handleValidationErrors, updateArticle);
router.delete('/:id', authenticateToken, requireAuthor, deleteArticle);
router.post('/:id/comments', authenticateToken, commentValidation, handleValidationErrors, addComment);
router.post('/:id/like', authenticateToken, toggleLike);

export default router;
