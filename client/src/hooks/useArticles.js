import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import * as articleService from '../services/articleService';

// Hook for fetching articles with pagination and filters
export const useArticles = (params = {}) => {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => articleService.getArticles(params),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook for fetching a single article
export const useArticle = (id) => {
  return useQuery({
    queryKey: ['article', id],
    queryFn: () => articleService.getArticle(id),
    enabled: !!id,
  });
};

// Hook for creating articles
export const useCreateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: articleService.createArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article created successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create article');
    },
  });
};

// Hook for updating articles
export const useUpdateArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => articleService.updateArticle(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['article', data._id] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article updated successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update article');
    },
  });
};

// Hook for deleting articles
export const useDeleteArticle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: articleService.deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      toast.success('Article deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete article');
    },
  });
};

// Hook for managing article state in forms
export const useArticleForm = (initialData = null) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: '',
    tags: [],
    image: null,
    status: 'draft',
    ...initialData,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: '',
      tags: [],
      image: null,
      status: 'draft',
    });
    setErrors({});
  };

  return {
    formData,
    setFormData,
    errors,
    setErrors,
    isSubmitting,
    setIsSubmitting,
    updateField,
    validateForm,
    resetForm,
  };
};
