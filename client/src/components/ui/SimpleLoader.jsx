import { useState, useEffect } from 'react';

const SimpleLoader = ({ 
  size = 'md', 
  text = '', 
  showText = false,
  fullScreen = false,
  overlay = false,
  className = '' 
}) => {
  const [dots, setDots] = useState('');

  // Animated dots for text
  useEffect(() => {
    if (showText && text) {
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [showText, text]);

  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  };

  const SpinnerLoader = () => (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className="relative">
        {/* Outer ring */}
        <div 
          className={`${sizes[size]} border-2 border-gray-200 rounded-full animate-spin`}
          style={{
            borderTopColor: '#000000',
            animationDuration: '1s'
          }}
        />
        {/* Inner dot */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-black rounded-full animate-pulse"
        />
      </div>
      {showText && text && (
        <div className={`${textSizes[size]} text-gray-700 font-medium`}>
          {text}{dots}
        </div>
      )}
    </div>
  );

  const content = (
    <div className={`flex items-center justify-center ${className}`}>
      <SpinnerLoader />
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

// Skeleton loader for content placeholders
const SkeletonLoader = ({ lines = 3, className = '' }) => (
  <div className={`animate-pulse space-y-3 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className="h-4 bg-gray-200 rounded"
        style={{
          width: index === lines - 1 ? '75%' : '100%'
        }}
      />
    ))}
  </div>
);

// Card skeleton for article cards
const CardSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="bg-gray-200 rounded-lg h-48 mb-4" />
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
      </div>
    </div>
  </div>
);

// Featured article skeleton
const FeaturedArticleSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="relative rounded-xl overflow-hidden h-[450px] bg-gray-200">
      {/* Content overlay skeleton */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 space-y-4">
        <div className="w-20 h-6 bg-gray-300 rounded" />
        <div className="space-y-2">
          <div className="h-8 bg-gray-300 rounded w-3/4" />
          <div className="h-8 bg-gray-300 rounded w-1/2" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-300 rounded" />
          <div className="h-4 bg-gray-300 rounded w-5/6" />
        </div>
        <div className="h-6 bg-gray-300 rounded w-32" />
      </div>
    </div>
  </div>
);

// Category page skeleton
const CategoryPageSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-10 bg-gray-200 rounded w-64 mb-4" />
        <div className="h-4 bg-gray-200 rounded w-96" />
      </div>
      
      {/* Filter skeleton */}
      <div className="mb-8 flex gap-4">
        <div className="h-10 bg-gray-200 rounded w-48" />
        <div className="h-10 bg-gray-200 rounded w-32" />
      </div>
      
      {/* Articles grid skeleton */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

// Page loading wrapper
const PageLoader = ({ children, loading, text = "Loading...", showText = true }) => {
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SimpleLoader 
          size="lg"
          text={text}
          showText={showText}
        />
      </div>
    );
  }
  return children;
};

// Article Page Skeleton
const ArticlePageSkeleton = ({ className = '' }) => (
  <div className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse ${className}`}>
    {/* Article Header Skeleton */}
    <header className="mb-8">
      {/* Category Badge Skeleton */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* Title Skeleton */}
      <div className="space-y-3 mb-6">
        <div className="h-8 bg-gray-200 rounded"></div>
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      </div>

      {/* Meta Information Skeleton */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 bg-gray-200 rounded"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Featured Image Skeleton */}
      <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg mb-8"></div>
    </header>

    {/* Article Content Skeleton */}
    <div className="max-w-none prose prose-lg mx-auto">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    </div>

    {/* Tags Section Skeleton */}
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="h-6 w-16 bg-gray-200 rounded mb-4"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
        <div className="h-6 w-18 bg-gray-200 rounded-full"></div>
      </div>
    </div>

    {/* Author Bio Skeleton */}
    <div className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1">
          <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SimpleLoader;
export { SkeletonLoader, CardSkeleton, FeaturedArticleSkeleton, CategoryPageSkeleton, PageLoader, ArticlePageSkeleton };
