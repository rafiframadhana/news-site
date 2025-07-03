import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';
import { verifyEmailDomain, verifyEmailExists } from '../utils/emailVerification.js';

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, bio, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email or username'
      });
    }
    
    // Double check email (in case validation middleware was bypassed)
    const emailParts = email.split('@');
    if (emailParts.length !== 2 || !emailParts[1].includes('.')) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }
    
    // Verify domain has valid MX records (can receive email)
    // Only in production to avoid slowing down development
    if (process.env.NODE_ENV === 'production' || process.env.VERIFY_EMAIL_EXISTENCE === 'true') {
      try {
        // Double-check with API (in case validation middleware was bypassed)
        const verificationResult = await verifyEmailExists(email);
        
        if (verificationResult.success && !verificationResult.deliverable) {
          return res.status(400).json({
            message: 'This email appears to be invalid or not deliverable'
          });
        }
        
        if (verificationResult.success && verificationResult.isDisposable) {
          return res.status(400).json({
            message: 'Disposable emails are not allowed'
          });
        }
        
        // If API check fails, fall back to MX record check
        if (!verificationResult.success) {
          const isDomainValid = await verifyEmailDomain(email);
          if (!isDomainValid) {
            return res.status(400).json({
              message: 'Email domain appears to be invalid or cannot receive emails'
            });
          }
        }
      } catch (error) {
        console.error('Email verification error:', error);
        // Continue with registration even if verification fails
        // This prevents the API from blocking legitimate users if verification fails
      }
    }

    // Create user
    const user = new User({
      username,
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      bio,
      role: role || 'author'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err) {
      return res.status(500).json({
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
      });
    }

    if (!user) {
      return res.status(401).json({
        message: info.message || 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        lastLogin: user.lastLogin
      }
    });
  })(req, res, next);
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, username } = req.body;
    const userId = req.user._id;

    // Check if username is taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          message: 'Username is already taken'
        });
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (bio !== undefined) updateData.bio = bio;
    if (username) updateData.username = username;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        role: user.role,
        bio: user.bio,
        avatar: user.avatar,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error during profile update',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
const verifyToken = (req, res) => {
  res.json({
    message: 'Token is valid',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
};

export {
  register,
  login,
  getMe,
  updateProfile,
  verifyToken
};
