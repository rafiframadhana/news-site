import Article from '../models/Article.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Helper function to extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  try {
    // Match Cloudinary URL pattern and extract public ID
    const match = url.match(/\/(?:v\d+\/)?([^\/]+\/[^\/]+)\.(?:jpg|jpeg|png|gif|webp|svg)$/i);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID from URL:', error);
    return null;
  }
};

// @desc    Get all articles with filters and pagination
// @route   GET /api/articles
// @access  Public
const getArticles = async (req, res) => {
  try {
    console.log('getArticles called with query:', req.query);
    console.log('getArticles user:', req.user ? { _id: req.user._id, role: req.user.role } : 'No user');
    
    const {
      page = 1,
      limit = 10,
      category,
      author,
      status,
      search,
      tags,
      featured,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Only show published articles for public access, unless:
    // 1. User is admin/author role, OR
    // 2. User is requesting their own articles
    const isRequestingOwnArticles = req.user && author && author === req.user._id.toString();
    
    console.log('getArticles filtering logic:');
    console.log('- author parameter:', author);
    console.log('- user._id:', req.user ? req.user._id.toString() : 'No user');
    console.log('- isRequestingOwnArticles:', isRequestingOwnArticles);
    console.log('- user role:', req.user ? req.user.role : 'No user');
    console.log('- status parameter:', status);
    
    if (!req.user || (!isRequestingOwnArticles && req.user.role !== 'admin' && req.user.role !== 'author')) {
      filter.status = 'published';
      console.log('- Applied status filter: published (public access)');
    } else if (status && !isRequestingOwnArticles) {
      // Only apply status filter if NOT requesting own articles
      filter.status = status;
      console.log('- Applied status filter from params:', status);
    } else if (isRequestingOwnArticles) {
      console.log('- No status filter applied (user requesting own articles)');
    } else {
      // Admin/author but no specific status requested
      filter.status = status || 'published';
      console.log('- Applied default status filter:', filter.status);
    }

    if (category) filter.category = category;
    if (author) filter.author = author;
    
    console.log('- Final filter:', filter);
    if (featured !== undefined) filter.featured = featured === 'true';
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const articles = await Article.find(filter)
      .populate('author', 'username firstName lastName fullName avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    console.log('getArticles query result:');
    console.log('- Found articles count:', articles.length);
    console.log('- Articles:', articles.map(a => ({ 
      title: a.title, 
      status: a.status, 
      author: a.author._id.toString(),
      views: a.views 
    })));

    // Get total count for pagination
    const total = await Article.countDocuments(filter);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      articles,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalArticles: total,
        hasNextPage,
        hasPrevPage,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching articles',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get single article by slug or ID
// @route   GET /api/articles/:slug
// @route   GET /api/articles/id/:id
// @access  Public
const getArticleBySlug = async (req, res) => {
  try {
    const { slug, id } = req.params;
    
    console.log('getArticleBySlug called with params:', { slug, id });
    console.log('User in request:', req.user ? { id: req.user._id, role: req.user.role } : 'No user');
    
    let query;
    if (id) {
      // If accessing via /id/:id route
      console.log('Fetching article by ID:', id);
      query = { _id: id };
    } else {
      // If accessing via /:slug route, check if slug looks like an ObjectId
      if (mongoose.Types.ObjectId.isValid(slug) && slug.length === 24) {
        console.log('Slug looks like an ObjectId, fetching by ID:', slug);
        query = { _id: slug };
      } else {
        console.log('Fetching article by slug:', slug);
        query = { slug };
      }
    }

    const article = await Article.findOne(query)
      .populate('author', 'username firstName lastName fullName avatar bio')
      .populate('comments.user', 'username firstName lastName fullName avatar');

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check if article is published or user has access
    if (article.status !== 'published') {
      console.log('Draft article access check:', {
        hasUser: !!req.user,
        userRole: req.user?.role,
        userId: req.user?._id?.toString(),
        articleAuthorId: article.author._id?.toString(),
        articleStatus: article.status
      });
      
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required to access draft articles' });
      } else if (req.user.role !== 'admin' && 
                article.author._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Access denied - you can only view your own draft articles' });
      }
    }

    // Increment view count
    if (article.status === 'published') {
      article.views += 1;
      await article.save();
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching article',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Create new article
// @route   POST /api/articles
// @access  Private (Author/Admin)
const createArticle = async (req, res) => {
  try {
    const {
      title,
      content,
      excerpt,
      featuredImage,
      category,
      tags,
      status,
      featured,
      seoTitle,
      seoDescription
    } = req.body;

    console.log('Creating article with data:', JSON.stringify(req.body, null, 2));

    // Validate required fields
    if (!title || !content || !category) {
      return res.status(400).json({
        message: 'Missing required fields',
        required: ['title', 'content', 'category'],
        received: { title: !!title, content: !!content, category: !!category }
      });
    }

    // Validate that featuredImage is provided
    if (!featuredImage || featuredImage.trim() === '') {
      return res.status(400).json({
        message: 'Featured image is required',
        error: 'Please upload a featured image for your article'
      });
    }

    // Ensure category is lowercase for validation
    const normalizedCategory = category.toLowerCase();

    const article = new Article({
      title,
      content,
      excerpt,
      featuredImage: featuredImage.trim(),
      category: normalizedCategory,
      tags: tags || [],
      author: req.user._id,
      status: status || 'draft',
      featured: featured || false,
      seoTitle,
      seoDescription
    });

    await article.save();
    await article.populate('author', 'username firstName lastName fullName avatar');

    res.status(201).json({
      message: 'Article created successfully',
      article
    });
  } catch (error) {
    console.error('Error creating article:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      message: 'Error creating article',
      error: process.env.NODE_ENV === 'development' ? error.message : {},
      details: error.toString()
    });
  }
};

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (Author/Admin)
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log('Updating article with ID:', id);
    console.log('Update data received:', JSON.stringify(updateData, null, 2));

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check ownership or admin role
    if (req.user.role !== 'admin' && 
        article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only edit your own articles.' 
      });
    }

    // Clean up the update data
    const cleanUpdateData = { ...updateData };
    
    // If featuredImage is empty or null, keep the existing one
    if (!cleanUpdateData.featuredImage) {
      cleanUpdateData.featuredImage = article.featuredImage;
    }

    // Ensure category is lowercase for validation
    if (cleanUpdateData.category) {
      cleanUpdateData.category = cleanUpdateData.category.toLowerCase();
    }

    // Update article
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      cleanUpdateData,
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName fullName avatar');

    res.json({
      message: 'Article updated successfully',
      article: updatedArticle
    });
  } catch (error) {
    console.error('Error updating article:', error);
    
    // Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    res.status(500).json({
      message: 'Error updating article',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Author/Admin)
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Check ownership or admin role
    if (req.user.role !== 'admin' && 
        article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete your own articles.' 
      });
    }

    // Delete the featured image from Cloudinary if it exists
    if (article.featuredImage) {
      try {
        const publicId = getPublicIdFromUrl(article.featuredImage);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted image from Cloudinary: ${publicId}`);
        }
      } catch (cloudinaryError) {
        console.warn('Failed to delete article image from Cloudinary:', cloudinaryError);
        // Continue with article deletion even if image deletion fails
      }
    }

    await Article.findByIdAndDelete(id);

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting article',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Add comment to article
// @route   POST /api/articles/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (article.status !== 'published') {
      return res.status(403).json({ message: 'Cannot comment on unpublished articles' });
    }

    article.comments.push({
      user: req.user._id,
      comment,
      createdAt: new Date()
    });

    await article.save();
    await article.populate('comments.user', 'username firstName lastName fullName avatar');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: article.comments[article.comments.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error adding comment',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Like/Unlike article
// @route   POST /api/articles/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    if (article.status !== 'published') {
      return res.status(403).json({ message: 'Cannot like unpublished articles' });
    }

    const likeIndex = article.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      article.likes.splice(likeIndex, 1);
    } else {
      // Like
      article.likes.push(userId);
    }

    await article.save();

    res.json({
      message: likeIndex > -1 ? 'Article unliked' : 'Article liked',
      likeCount: article.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error toggling like',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get articles by author
// @route   GET /api/articles/author/:authorId
// @access  Public
const getArticlesByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { 
      author: authorId,
      status: 'published'
    };

    const articles = await Article.find(filter)
      .populate('author', 'username firstName lastName fullName avatar')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Article.countDocuments(filter);

    res.json({
      articles,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalArticles: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching articles by author',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    // Get distinct categories from articles
    const categories = await Article.distinct('category', { status: 'published' });
    
    // Define predefined categories with metadata
    const predefinedCategories = [
      { name: 'Technology', slug: 'technology', description: 'Latest tech news and innovations' },
      { name: 'Politics', slug: 'politics', description: 'Political news and analysis' },
      { name: 'Business', slug: 'business', description: 'Business and financial news' },
      { name: 'Sports', slug: 'sports', description: 'Sports news and updates' },
      { name: 'Entertainment', slug: 'entertainment', description: 'Entertainment and celebrity news' },
      { name: 'Health', slug: 'health', description: 'Health and wellness news' },
      { name: 'Science', slug: 'science', description: 'Scientific discoveries and research' },
      { name: 'World', slug: 'world', description: 'International news and events' },
      { name: 'Lifestyle', slug: 'lifestyle', description: 'Lifestyle and culture news' },
      { name: 'Education', slug: 'education', description: 'Education news and insights' }
    ];

    // Combine predefined categories with dynamic ones from database
    const allCategories = predefinedCategories.map(cat => {
      const articleCount = categories.filter(dbCat => 
        dbCat.toLowerCase() === cat.slug.toLowerCase()
      ).length;
      return {
        ...cat,
        articleCount: articleCount > 0 ? articleCount : 0
      };
    });

    res.json({
      success: true,
      categories: allCategories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

export {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  addComment,
  toggleLike,
  getArticlesByAuthor,
  getCategories
};
