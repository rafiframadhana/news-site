import { format, formatDistanceToNow, parseISO } from 'date-fns';

// Format date for display
export const formatDate = (date, formatString = 'PPP') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatString);
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

// Format date for forms (YYYY-MM-DD)
export const formatDateForInput = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy-MM-dd');
};

// Calculate reading time based on content
export const getReadingTime = (content) => {
  if (!content) return 1;
  
  // Remove HTML tags and count words
  const plainText = content.replace(/<[^>]+>/g, '');
  const wordCount = plainText.split(' ').filter(word => word.length > 0).length;
  
  // Average reading speed is 200 words per minute
  return Math.max(1, Math.ceil(wordCount / 200));
};
