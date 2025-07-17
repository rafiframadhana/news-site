# Atjeh Times - A Full-Stack News Site

A full-stack MERN (MongoDB, Express, React, Node.js) news website with a modern design, advanced features, and a serverless backend deployment option on Vercel.

![Atjeh Times](https://i.imgur.com/uk3wGuL.png)

## 📋 Overview

Atjeh Times is a feature-rich news website that allows users to read articles across various categories, authors to create and manage content, and administrators to oversee the entire platform. The application is built with modern web technologies and follows best practices for performance, security, and user experience.

## ✨ Features

### 📱 User Features
- **Responsive Design**: Fully responsive interface that works across all devices
- **Article Reading**: Browse and read articles across multiple categories
- **Search Functionality**: Search articles by keyword, author, or category
- **User Authentication**: Secure login and registration with email verification
- **User Profiles**: Customizable user profiles with avatars

### ✍️ Author Features
- **Article Management**: Create, edit, and delete articles
- **Rich Text Editor**: Format articles with a powerful WYSIWYG editor
- **Image Upload**: Upload and manage images via Cloudinary integration
- **Article Analytics**: View article performance metrics
- **Author Dashboard**: Monitor content performance

### 👑 Admin Features
- **User Management**: Manage users, roles, and permissions
- **Content Moderation**: Review and moderate article submissions
- **Category Management**: Create and organize content categories
- **Analytics Dashboard**: Monitor site traffic and user engagement

## 🛠️ Technology Stack

### Frontend
- **React**: UI library for building the user interface
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Next-generation frontend tooling for faster development
- **React Router**: For client-side routing
- **Context API**: For state management

### Backend
- **Node.js**: JavaScript runtime for the server
- **Express**: Web framework for Node.js
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling for Node.js
- **Passport**: Authentication middleware
- **JWT**: Token-based authentication

### Services & Integrations
- **Cloudinary**: Cloud-based image management
- **Abstract API**: Email validation service
- **Vercel**: Serverless deployment platform

## 🏗️ Architecture

The project follows a modern architecture with:

- **Client-Server Separation**: Distinct frontend and backend applications
- **RESTful API Design**: Clean and consistent API endpoints
- **MVC Pattern**: Model-View-Controller pattern on the backend
- **Component-Based UI**: Reusable React components
- **Responsive Design**: Mobile-first approach using Tailwind CSS

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or later)
- MongoDB (local or Atlas)
- Cloudinary account
- Abstract API account (optional, for email verification)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/atjeh-times.git
   cd atjeh-times
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your credentials
   npm run dev
   ```

3. **Set up the frontend**
   ```bash
   cd ../client
   npm install
   cp .env.example .env
   # Edit .env with your API URL
   npm run dev
   ```

4. **Access the application**
   - Backend: http://localhost:5000
   - Frontend: http://localhost:5173

## 📦 Project Structure

```
news-site/
├── client/                  # React frontend
│   ├── public/              # Static files
│   └── src/                 # Source files
│       ├── assets/          # Images, fonts, etc.
│       ├── components/      # Reusable components
│       ├── context/         # React Context providers
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Page components
│       ├── services/        # API service calls
│       └── utils/           # Utility functions
├── server/                  # Express backend
│   ├── config/              # Configuration files
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/              # Mongoose models
│   ├── routes/              # API routes
│   └── utils/               # Utility functions
└── README.md                # This file
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Articles
- `GET /api/articles` - Get all articles
- `GET /api/articles/:id` - Get article by ID
- `POST /api/articles` - Create article (auth required)
- `PUT /api/articles/:id` - Update article (auth required)
- `DELETE /api/articles/:id` - Delete article (auth required)

### Categories
- `GET /api/categories` - Get all categories

### Users
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## 🔐 Environment Variables

### Backend (.env)
```
# Database
MONGODB_URI=your_mongodb_uri

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Verification
ABSTRACT_API_KEY=your_abstract_api_key
VERIFY_EMAIL_EXISTENCE=true
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.