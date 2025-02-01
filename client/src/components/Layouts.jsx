import React from "react";

const Container = ({ children, className = "" }) => (
  <div className={`w-full px-4 ${className}`}>
    <div className="max-w-6xl mx-auto">{children}</div>
  </div>
);

const Column = ({ children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>{children}</div>
);

const Title = ({ content, size = "large", className = "" }) => {
  const sizeClasses = {
    small: "text-2xl",
    medium: "text-4xl",
    large: "text-6xl",
  };

  return (
    <h1 className={`font-bold ${sizeClasses[size]} ${className}`}>{content}</h1>
  );
};

const Text = ({ content, className = "" }) => (
  <p className={`text-xl ${className}`}>{content}</p>
);

const Image = ({ src, alt = "", className = "", onError }) => (
  <img
    src={src}
    alt={alt}
    onError={onError}
    className={`rounded-lg ${className}`}
  />
);

export const layouts = {
  titleOnly: {
    id: "titleOnly",
    name: "Title Only",
    component: ({ title }) => (
      <Container className="title-only-container">
        <Column className="items-center justify-center">
          {title && (
            <Title content={title} size="large" className="text-center" />
          )}
        </Column>
      </Container>
    ),
  },

  textOnly: {
    id: "textOnly",
    name: "Text Only",
    component: ({ text }) => (
      <Container className="text-only-container">
        <Column className="items-center justify-center min-h-screen">
          {text && <Text content={text} className="text-center max-w-2xl" />}
        </Column>
      </Container>
    ),
  },

  imageOnly: {
    id: "imageOnly",
    name: "Image Only",
    component: ({ image, onImageError }) => (
      <Container className="image-only-container">
        {image && (
          <Image src={image} onError={onImageError} className="w-full h-auto" />
        )}
      </Container>
    ),
  },

  titleText: {
    id: "titleText",
    name: "Title Text",
    component: ({ title, text }) => (
      <Container className="title-text-container">
        <div className="title-container">
          {title && (
            <Title content={title} size="large" className="text-center" />
          )}
        </div>
        <div className="text-container">
          {text && <Text content={text} className="text-center max-w-3xl" />}
        </div>
      </Container>
    ),
  },

  titleImage: {
    id: "titleImage",
    name: "Title Image",
    component: ({ title, image, onImageError }) => (
      <Container className="title-image-container">
        <div className="title-section">
          {title && (
            <Title content={title} size="large" className="text-center" />
          )}
        </div>
        <div className="image-section">
          {image && (
            <Image
              src={image}
              onError={onImageError}
              className="w-full h-auto max-h-96 object-contain"
            />
          )}
        </div>
      </Container>
    ),
  },

  textImage: {
    id: "textImage",
    name: "Text Image",
    component: ({ text, image, onImageError }) => (
      <Container className="text-image-container">
        <div className="content-section">
          <div className="text-section">
            {text && <Text content={text} className="text-center max-w-3xl" />}
          </div>
          <div className="image-section">
            {image && (
              <Image
                src={image}
                onError={onImageError}
                className="w-full h-auto max-h-96 object-contain"
              />
            )}
          </div>
        </div>
      </Container>
    ),
  },

  titleTextImage: {
    id: "titleTextImage",
    name: "Title, Text, and Image",
    component: ({ title, text, image, onImageError }) => (
      <Container className="title-text-image-container">
        <div className="title-section">
          {title && (
            <Title content={title} size="large" className="text-center" />
          )}
        </div>
        <div className="content-section">
          <div className="text-section">
            {text && <Text content={text} className="text-center max-w-3xl" />}
          </div>
          <div className="image-section">
            {image && (
              <Image
                src={image}
                onError={onImageError}
                className="w-full h-auto max-h-96 object-contain"
              />
            )}
          </div>
        </div>
      </Container>
    ),
  },
};

export default layouts;
