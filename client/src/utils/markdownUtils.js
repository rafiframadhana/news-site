import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked options
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false,
  pedantic: false,
  sanitize: false,
  silent: false,
  smartLists: true,
  smartypants: false,
  xhtml: false
});

/**
 * Convert markdown to sanitized HTML
 * @param {string} markdown - The markdown content to convert
 * @returns {string} - Sanitized HTML string
 */
export const markdownToHtml = (markdown) => {
  if (!markdown) return '';
  
  try {
    // Convert markdown to HTML
    const html = marked(markdown);
    
    // Sanitize the HTML to prevent XSS attacks
    const sanitizedHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'p', 'br', 'strong', 'em', 'u', 'code', 'pre',
        'blockquote', 'ul', 'ol', 'li',
        'a', 'img',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'hr', 'div', 'span'
      ],
      ALLOWED_ATTR: [
        'href', 'src', 'alt', 'title', 'class', 'id',
        'target', 'rel', 'width', 'height'
      ],
      ALLOW_DATA_ATTR: false
    });
    
    return sanitizedHtml;
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return DOMPurify.sanitize(markdown.replace(/\n/g, '<br />'));
  }
};

/**
 * Check if content is markdown (basic heuristic)
 * @param {string} content - The content to check
 * @returns {boolean} - True if content appears to be markdown
 */
export const isMarkdown = (content) => {
  if (!content) return false;
  
  // Look for common markdown patterns
  const markdownPatterns = [
    /^#{1,6}\s/m,           // Headers
    /\*\*.*?\*\*/,          // Bold
    /\*.*?\*/,              // Italic
    /`.*?`/,                // Code
    /^\s*[-*+]\s/m,         // Unordered lists
    /^\s*\d+\.\s/m,         // Ordered lists
    /^\s*>/m,               // Blockquotes
    /\[.*?\]\(.*?\)/,       // Links
    /!\[.*?\]\(.*?\)/       // Images
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
};

/**
 * Get plain text from markdown (for excerpts, etc.)
 * @param {string} markdown - The markdown content
 * @param {number} maxLength - Maximum length of the text
 * @returns {string} - Plain text
 */
export const markdownToPlainText = (markdown, maxLength = 200) => {
  if (!markdown) return '';
  
  try {
    // Convert to HTML first
    const html = marked(markdown);
    
    // Strip HTML tags
    const text = html.replace(/<[^>]*>/g, '');
    
    // Clean up whitespace
    const cleanText = text.replace(/\s+/g, ' ').trim();
    
    // Truncate if needed
    if (cleanText.length > maxLength) {
      return cleanText.substring(0, maxLength) + '...';
    }
    
    return cleanText;
  } catch (error) {
    console.error('Error converting markdown to plain text:', error);
    return markdown.substring(0, maxLength) + (markdown.length > maxLength ? '...' : '');
  }
};
