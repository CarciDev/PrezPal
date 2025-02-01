import React from "react";
import { layouts } from "./Layouts";

const Slide = ({
  layout = "titleTextImage",
  title,
  text,
  image,
  onImageError,
}) => {
  const determineLayout = () => {
    if (title && !text && !image) return "titleOnly";
    if (!title && text && !image) return "textOnly";
    if (!title && !text && image) return "imageOnly";
    if (title && text && !image) return "titleText";
    if (title && !text && image) return "titleImage";
    if (!title && text && image) return "textImage";
    if (title && text && image) return "titleTextImage";
    return layout;
  };

  if (!selectedLayout) {
    console.warn(
      `Layout "${layout}" not found, falling back to title, text, and image layout`
    );
    return layouts.titleTextImage.component({
      title,
      text,
      image,
      onImageError,
    });
  }

  return selectedLayout.component({ title, text, image, onImageError });
};

export default Slide;
