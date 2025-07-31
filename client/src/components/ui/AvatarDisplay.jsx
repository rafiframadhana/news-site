import React from 'react';

const AvatarDisplay = ({ 
  avatar, 
  userInitials = "U", 
  size = "md", 
  className = "",
  onClick,
  title
}) => {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm", 
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-xl",
    xl: "w-20 h-20 text-2xl",
    "2xl": "w-32 h-32 text-4xl"
  };

  const baseClasses = `rounded-full overflow-hidden bg-blue-100 flex items-center justify-center ${sizeClasses[size]} ${className}`;
  const interactiveClasses = onClick ? "cursor-pointer hover:bg-blue-200 transition-colors duration-200" : "";

  return (
    <div 
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={onClick}
      title={title}
    >
      {avatar ? (
        <img
          src={avatar}
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-blue-600 font-semibold">
          {userInitials}
        </span>
      )}
    </div>
  );
};

export default AvatarDisplay;
