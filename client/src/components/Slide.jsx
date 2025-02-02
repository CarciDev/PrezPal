import React from "react";
import { layouts } from "./Layouts";

const Slide = ({ elements, onImageError }) => {
  const determineLayout = () => {
    const hasTitle = elements.some((el) => el.type === "title" && el.content);
    const hasText = elements.some((el) => el.type === "text" && el.content);
    const hasImage = elements.some((el) => el.type === "image" && el.src);

    if (hasTitle && !hasText && !hasImage) return "titleOnly";
    if (!hasTitle && hasText && !hasImage) return "textOnly";
    if (!hasTitle && !hasText && hasImage) return "imageOnly";
    if (hasTitle && hasText && !hasImage) return "titleText";
    if (hasTitle && !hasText && hasImage) return "titleImage";
    if (!hasTitle && hasText && hasImage) return "textImage";
    if (hasTitle && hasText && hasImage) return "titleTextImage";
    return "titleTextImage";
  };

  const layout = determineLayout();
  const selectedLayout = layouts[layout];

  if (!selectedLayout) {
    console.warn(
      `Layout "${layout}" not found, falling back to title, text, and image layout`
    );
    return layouts.titleTextImage.component({ elements, onImageError });
  }

  return selectedLayout.component({ elements, onImageError });
};

export default Slide;
