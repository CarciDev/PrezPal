import React from "react";
import { Title, Text, Image } from "./Elements";

const Container = ({ children, className = "" }) => (
  <div className={`w-full px-4 ${className}`}>
    <div className="max-w-6xl mx-auto">{children}</div>
  </div>
);

const Column = ({ children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>{children}</div>
);

export const layouts = {
  titleOnly: {
    id: "titleOnly",
    name: "Title Only",
    component: ({ elements }) => (
      <Container className="title-only-container">
        <Column className="items-center justify-center">
          {elements
            .filter((el) => el.type === "title")
            .map((el, index) => (
              <Title
                key={index}
                content={el.content}
                size={el.size}
                color={el.color}
                className="text-center"
              />
            ))}
        </Column>
      </Container>
    ),
  },

  textOnly: {
    id: "textOnly",
    name: "Text Only",
    component: ({ elements }) => (
      <Container className="text-only-container">
        <Column className="items-center justify-center min-h-screen">
          {elements
            .filter((el) => el.type === "text")
            .map((el, index) => (
              <Text
                key={index}
                content={el.content}
                color={el.color}
                className="text-center max-w-2xl"
              />
            ))}
        </Column>
      </Container>
    ),
  },

  imageOnly: {
    id: "imageOnly",
    name: "Image Only",
    component: ({ elements, onImageError }) => (
      <Container className="image-only-container">
        {elements
          .filter((el) => el.type === "image")
          .map((el, index) => (
            <Image
              key={index}
              src={el.src}
              onError={onImageError}
              className="w-full h-auto"
            />
          ))}
      </Container>
    ),
  },

  titleText: {
    id: "titleText",
    name: "Title Text",
    component: ({ elements }) => (
      <Container className="title-text-container">
        <div className="title-container">
          {elements
            .filter((el) => el.type === "title")
            .map((el, index) => (
              <Title
                key={index}
                content={el.content}
                size={el.size}
                color={el.color}
                className="text-center"
              />
            ))}
        </div>
        <div className="text-container">
          {elements
            .filter((el) => el.type === "text")
            .map((el, index) => (
              <Text
                key={index}
                content={el.content}
                color={el.color}
                className="text-center max-w-3xl"
              />
            ))}
        </div>
      </Container>
    ),
  },

  titleImage: {
    id: "titleImage",
    name: "Title Image",
    component: ({ elements, onImageError }) => (
      <Container className="title-image-container">
        <div className="title-section">
          {elements
            .filter((el) => el.type === "title")
            .map((el, index) => (
              <Title
                key={index}
                content={el.content}
                size={el.size}
                color={el.color}
                className="text-center"
              />
            ))}
        </div>
        <div className="image-section">
          {elements
            .filter((el) => el.type === "image")
            .map((el, index) => (
              <Image
                key={index}
                src={el.src}
                onError={onImageError}
                className="w-full h-auto max-h-96 object-contain"
              />
            ))}
        </div>
      </Container>
    ),
  },

  textImage: {
    id: "textImage",
    name: "Text Image",
    component: ({ elements, onImageError }) => (
      <Container className="text-image-container">
        <div className="content-section">
          <div className="text-section">
            {elements
              .filter((el) => el.type === "text")
              .map((el, index) => (
                <Text
                  key={index}
                  content={el.content}
                  color={el.color}
                  className="text-center max-w-3xl"
                />
              ))}
          </div>
          <div className="image-section">
            {elements
              .filter((el) => el.type === "image")
              .map((el, index) => (
                <Image
                  key={index}
                  src={el.src}
                  onError={onImageError}
                  className="w-full h-auto max-h-96 object-contain"
                />
              ))}
          </div>
        </div>
      </Container>
    ),
  },

  titleTextImage: {
    id: "titleTextImage",
    name: "Title, Text, and Image",
    component: ({ elements, onImageError }) => (
      <Container className="title-text-image-container">
        <div className="title-section">
          {elements
            .filter((el) => el.type === "title")
            .map((el, index) => (
              <Title
                key={index}
                content={el.content}
                size={el.size}
                color={el.color}
                className="text-center"
              />
            ))}
        </div>
        <div className="content-section">
          <div className="text-section">
            {elements
              .filter((el) => el.type === "text")
              .map((el, index) => (
                <Text
                  key={index}
                  content={el.content}
                  color={el.color}
                  className="text-center max-w-3xl"
                />
              ))}
          </div>
          <div className="image-section">
            {elements
              .filter((el) => el.type === "image")
              .map((el, index) => (
                <Image
                  key={index}
                  src={el.src}
                  onError={onImageError}
                  className="w-full h-auto max-h-96 object-contain"
                />
              ))}
          </div>
        </div>
      </Container>
    ),
  },
};

export default layouts;
