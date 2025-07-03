import User from '../models/User.js';
import Article from '../models/Article.js';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build filter object
    const filter = {};
    if (role) filter.role = role;
    
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await User.countDocuments(filter);

    // Get article counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const articleCount = await Article.countDocuments({ author: user._id });
        const publishedCount = await Article.countDocuments({ 
          author: user._id, 
          status: 'published' 
        });
        
        return {
          ...user,
          stats: {
            totalArticles: articleCount,
            publishedArticles: publishedCount
          }
        };
      })
    );

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      users: usersWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching users',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin or own profile)
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is trying to access their own profile or is admin
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied. You can only view your own profile.'
      });
    }

    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's article statistics
    const totalArticles = await Article.countDocuments({ author: id });
    const publishedArticles = await Article.countDocuments({ 
      author: id, 
      status: 'published' 
    });
    const draftArticles = await Article.countDocuments({ 
      author: id, 
      status: 'draft' 
    });

    // Get recent articles
    const recentArticles = await Article.find({ author: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title slug status createdAt publishedAt')
      .lean();

    res.json({
      user: {
        ...user,
        stats: {
          totalArticles,
          publishedArticles,
          draftArticles
        },
        recentArticles
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get user by username
// @route   GET /api/users/username/:username
// @access  Public
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('-password').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's published article statistics (public info only)
    const totalArticles = await Article.countDocuments({ 
      author: user._id, 
      status: 'published' 
    });

    res.json({
      ...user,
      stats: {
        totalArticles
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isActive, firstName, lastName, bio } = req.body;

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === id && isActive === false) {
      return res.status(400).json({
        message: 'You cannot deactivate your own account'
      });
    }

    const updateData = {};
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error updating user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has articles
    const articleCount = await Article.countDocuments({ author: id });
    
    if (articleCount > 0) {
      return res.status(400).json({
        message: `Cannot delete user. They have ${articleCount} articles. Please transfer or delete their articles first.`
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get user dashboard stats
// @route   GET /api/users/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let stats = {};

    if (userRole === 'admin') {
      // Admin dashboard stats
      const totalUsers = await User.countDocuments();
      const totalAuthors = await User.countDocuments({ role: 'author' });
      const totalAdmins = await User.countDocuments({ role: 'admin' });
      const totalArticles = await Article.countDocuments();
      const publishedArticles = await Article.countDocuments({ status: 'published' });
      const draftArticles = await Article.countDocuments({ status: 'draft' });
      
      // Recent articles across all users
      const recentArticles = await Article.find()
        .populate('author', 'username firstName lastName fullName')
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title slug status author createdAt publishedAt')
        .lean();

      stats = {
        users: {
          total: totalUsers,
          authors: totalAuthors,
          admins: totalAdmins
        },
        articles: {
          total: totalArticles,
          published: publishedArticles,
          drafts: draftArticles
        },
        recentArticles
      };
    } else {
      // Author dashboard stats
      const myArticles = await Article.countDocuments({ author: userId });
      const myPublished = await Article.countDocuments({ 
        author: userId, 
        status: 'published' 
      });
      const myDrafts = await Article.countDocuments({ 
        author: userId, 
        status: 'draft' 
      });

      // Calculate total views for user's articles
      const viewsResult = await Article.aggregate([
        { $match: { author: userId } },
        { $group: { _id: null, totalViews: { $sum: '$views' } } }
      ]);
      const totalViews = viewsResult.length > 0 ? viewsResult[0].totalViews : 0;

      // Recent articles by the user
      const recentArticles = await Article.find({ author: userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title slug status createdAt publishedAt views')
        .lean();

      stats = {
        articles: {
          total: myArticles,
          published: myPublished,
          drafts: myDrafts
        },
        totalViews,
        recentArticles
      };
    }

    res.json({ stats });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Get authors list (for public author pages)
// @route   GET /api/users/authors
// @access  Public
const getAuthors = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const authors = await User.find({ 
      role: { $in: ['author', 'admin'] },
      isActive: true 
    })
    .select('username firstName lastName fullName bio avatar createdAt role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    // Get article count for each author
    const authorsWithStats = await Promise.all(
      authors.map(async (author) => {
        const articleCount = await Article.countDocuments({ 
          author: author._id, 
          status: 'published' 
        });
        
        return {
          ...author,
          articleCount
        };
      })
    );

    const total = await User.countDocuments({ 
      role: { $in: ['author', 'admin'] }, 
      isActive: true 
    });

    res.json({
      authors: authorsWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalAuthors: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching authors',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

export {
  getAllUsers,
  getUserById,
  getUserByUsername,
  updateUser,
  deleteUser,
  getDashboardStats,
  getAuthors
};
