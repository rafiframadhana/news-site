// Available news categories
export const CATEGORIES = [
  { value: 'politics', label: 'Politics', color: 'bg-red-500' },
  { value: 'business', label: 'Business', color: 'bg-green-500' },
  { value: 'technology', label: 'Technology', color: 'bg-blue-500' },
  { value: 'sports', label: 'Sports', color: 'bg-orange-500' },
  { value: 'entertainment', label: 'Entertainment', color: 'bg-purple-500' },
  { value: 'health', label: 'Health', color: 'bg-pink-500' },
  { value: 'science', label: 'Science', color: 'bg-indigo-500' },
  { value: 'world', label: 'World', color: 'bg-gray-500' },
  { value: 'local', label: 'Local', color: 'bg-yellow-500' },
  { value: 'opinion', label: 'Opinion', color: 'bg-teal-500' },
];

// Utility function to get category label from value
export const getCategoryLabel = (value) => {
  const category = CATEGORIES.find(cat => cat.value === value);
  return category ? category.label : value?.charAt(0).toUpperCase() + value?.slice(1) || '';
};

// Article statuses
export const ARTICLE_STATUS = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500' },
  { value: 'published', label: 'Published', color: 'bg-green-500' },
  { value: 'archived', label: 'Archived', color: 'bg-red-500' },
];

// User roles
export const USER_ROLES = [
  { value: 'author', label: 'Author' },
  { value: 'admin', label: 'Admin' },
];

// Pagination limits
export const PAGINATION_LIMITS = [5, 10, 20, 50];

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/auth',
  ARTICLES: '/articles',
  USERS: '/users',
  UPLOAD: '/upload',
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
};

// Default values
export const DEFAULTS = {
  ARTICLE_EXCERPT_LENGTH: 200,
  PAGINATION_LIMIT: 10,
  IMAGE_MAX_SIZE_MB: 10,
  ARTICLE_TITLE_MAX_LENGTH: 200,
  COMMENT_MAX_LENGTH: 1000,
};
