import React from "react";

export const Title = ({
  content,
  size = "large",
  color = "black",
  className = "",
}) => {
  const sizeClasses = {
    small: "text-2xl",
    medium: "text-4xl",
    large: "text-6xl",
  };

  return (
    <h1
      className={`font-bold ${sizeClasses[size]} ${className}`}
      style={{ color }}
    >
      {content}
    </h1>
  );
};

export const Text = ({
  content,
  size = "medium",
  color = "black",
  className = "",
}) => {
  const sizeClasses = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <p className={`${sizeClasses[size]} ${className}`} style={{ color }}>
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
