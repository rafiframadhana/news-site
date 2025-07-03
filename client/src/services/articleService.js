import { api } from './api';

export const articleService = {
  // Get all articles with filters
  getArticles: async (params = {}) => {
    const response = await api.articles.getAll(params);
    return response.data; // Return the full response with articles and pagination
  },

  // Get single article by slug
  getArticleBySlug: async (slug) => {
    const response = await api.articles.getBySlug(slug);
    return response.data;
  },

  // Get single article by ID (with direct ID endpoint)
  getArticle: async (id) => {
    try {
      // Use explicit id endpoint - axios interceptor will add the auth token automatically
      console.log('Fetching article by ID:', id);
      
      // Try the new getById endpoint first for better draft access
      const response = await api.articles.getById(id);
      console.log('Article fetch response:', response.status, response.data?.title, response.data?.status);
      return response.data;
    } catch (error) {
      console.error('Error fetching article by ID:', error);
      console.error('Error response:', error.response?.status, error.response?.data);
      
      // If it's a 403 or 401 error, the user might need to reauthenticate
      if (error.response?.status === 401) {
        throw new Error('Authentication error. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to access this article.');
      }
      
      throw error;
    }
  },

  // Get articles by author (using getAll with author filter)
  getArticlesByAuthor: async (authorId, params = {}) => {
    console.log('=== getArticlesByAuthor START ===');
    console.log('getArticlesByAuthor called with authorId:', authorId, 'params:', params);
    // Don't filter by status when getting user's own articles - let the server decide
    const { status, ...otherParams } = params; // eslint-disable-line no-unused-vars
    const finalParams = { ...otherParams, author: authorId };
    console.log('Final API params:', finalParams);
    
    const response = await api.articles.getAll(finalParams);
    console.log('getArticlesByAuthor raw response:', response);
    console.log('getArticlesByAuthor response.data:', response.data);
    console.log('=== getArticlesByAuthor END ===');
    return response.data;
  },

  // Create new article
  createArticle: async (articleData) => {
    console.log('Creating article with data:', articleData);
    const response = await api.articles.create(articleData);
    return response.data;
  },

  // Update article
  updateArticle: async (id, articleData) => {
    const response = await api.articles.update(id, articleData);
    return response.data;
  },

  // Delete article
  deleteArticle: async (id) => {
    const response = await api.articles.delete(id);
    return response.data;
  },

  // Add comment to article
  addComment: async (articleId, comment) => {
    const response = await api.post(`/articles/${articleId}/comments`, { comment });
    return response.data;
  },

  // Like/Unlike article
  toggleLike: async (articleId) => {
    const response = await api.post(`/articles/${articleId}/like`);
    return response.data;
  },
};

// Named exports for hooks compatibility
export const getArticles = articleService.getArticles;
export const getArticle = articleService.getArticleBySlug;
export const createArticle = articleService.createArticle;
export const updateArticle = articleService.updateArticle;
export const deleteArticle = articleService.deleteArticle;
export const getArticlesByAuthor = articleService.getArticlesByAuthor;
export const addComment = articleService.addComment;
export const toggleLike = articleService.toggleLike;
