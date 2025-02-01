import React from "react";

export const Title = ({ content, size = "large", className = "" }) => {
  const sizeClasses = {
    small: "text-2xl",
    medium: "text-4xl",
    large: "text-6xl",
  };

  return (
    <h1 className={`font-bold text-gray-800 ${sizeClasses[size]} ${className}`}>
      {content}
    </h1>
  );
};

export const Text = ({ content, size = "medium", className = "" }) => {
  const sizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <p className={`text-gray-600 ${sizeClasses[size]} ${className}`}>
      {content}
    </p>
  );
};

export const Image = ({
  src,
  alt = "",
  size = "medium",
  onError,
  className = "",
}) => {
  const sizeClasses = {
    small: "w-1/3",
    medium: "w-1/2",
    large: "w-2/3",
  };

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <img
        src={src}
        alt={alt}
        onError={onError}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
