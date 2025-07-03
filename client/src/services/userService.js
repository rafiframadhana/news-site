import axios from 'axios';

export const userService = {
  // Get all users (admin only)
  getAllUsers: async (params = {}) => {
    const response = await axios.get('/api/users', { params });
    return response.data;
  },

  // Get user by ID
  getUserById: async (id) => {
    const response = await axios.get(`/api/users/${id}`);
    return response.data;
  },

  // Update user (admin only)
  updateUser: async (id, userData) => {
    const response = await axios.put(`/api/users/${id}`, userData);
    return response.data;
  },
  
  // Update user's own profile (for all authenticated users)
  updateProfile: async (userData) => {
    const response = await axios.put('/api/auth/profile', userData);
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (id) => {
    const response = await axios.delete(`/api/users/${id}`);
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await axios.get('/api/users/dashboard/stats');
    return response.data;
  },

  // Get authors list (public)
  getAuthors: async (params = {}) => {
    const response = await axios.get('/api/users/authors', { params });
    return response.data;
  },

  // Get user by username
  getUserByUsername: async (username) => {
    const response = await axios.get(`/api/users/username/${username}`);
    return response.data;
  },
};

// Named exports for hooks compatibility
export const getUsers = userService.getAllUsers;
export const getUser = userService.getUserById;
export const updateUser = userService.updateUser;
export const deleteUser = userService.deleteUser;
export const updateUserRole = (id, role) => userService.updateUser(id, { role });
export const getDashboardStats = userService.getDashboardStats;
export const getAuthors = userService.getAuthors;
