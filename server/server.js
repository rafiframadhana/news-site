import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import passport from 'passport';
import { validateCloudinary } from './config/cloudinary.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/upload.js';

// Import passport config
import configurePassport from './config/passport.js';
configurePassport(passport);

// Initialize MongoDB connection
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'atjeh-times'
    });
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
    
    // Validate Cloudinary configuration
    const cloudinaryValid = await validateCloudinary();
    if (!cloudinaryValid && process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Cloudinary configuration invalid');
    }
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    isConnected = false;
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  }
};

const app = express();

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    ...(process.env.NODE_ENV !== 'production' ? [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
    ] : []),
    /\.trycloudflare\.com$/,
  ].filter(Boolean),
  credentials: true
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// Categories endpoint
app.get('/api/categories', async (req, res) => {
  try {
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

    res.json({
      success: true,
      categories: predefinedCategories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      message: 'Failed to fetch categories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running successfully!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const startServer = async () => {
    try {
      await connectToDatabase();
      
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        if (process.env.NODE_ENV !== 'production') {
          console.log(`📍 Environment: ${process.env.NODE_ENV}`);
          console.log('📸 Image uploads configured for Cloudinary only');
          console.log(`🚀 Server running on port ${PORT}`);
        }
      });
    } catch (error) {
      console.error('❌ Server startup failed:', error.message);
      process.exit(1);
    }
  };
  
  startServer();
}

// For serverless environment (Vercel)
export default async function handler(req, res) {
  await connectToDatabase();
  return app(req, res);
}
