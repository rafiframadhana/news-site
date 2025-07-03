const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
      <div className={`animate-spin rounded-full border-b-2 border-black ${sizes[size]} ${className}`} />
  );
};

export default LoadingSpinner;
