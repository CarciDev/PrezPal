import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

const PresentationContext = createContext();

const createUniqueId = () => {
  return Math.random().toString(16).slice(2);
};

const DEFAULT_PRESENTATION = {
  name: "My Presentation",
  slides: [
    {
      layout: "titleTextImage",
      id: 1,
      elements: [
        {
          id: 2,
          type: "title",
          content: "Welcome to the Presentation",
          size: "large",
          color: "#000000",
        },
        {
          id: 3,
          type: "text",
          content: "",
          size: "medium",
          color: "#000000",
        },
        {
          id: 4,
          type: "image",
          src: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
          size: "medium",
        },
      ],
    },
  ],
};

export const usePresentation = () => {
  const context = useContext(PresentationContext);
  if (!context) {
    throw new Error(
      "usePresentation must be used within a PresentationProvider"
    );
  }
  return context;
};

const PresentationProvider = ({ children }) => {
  const [presentation, setPresentation] = useLocalStorage(
    "presentation",
    DEFAULT_PRESENTATION
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [stateStack, setStateStack] = useState([]);

  const pushState = () => {
    setStateStack((prev) => [...prev, presentation]);
  };

  const popState = () => {
    if (stateStack.length > 0) {
      setPresentation(stateStack[stateStack.length - 1]);
      setStateStack((prev) => prev.slice(0, -1));
    }
  };

  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const addSlide = (newSlide) => {
    setPresentation((prev) => ({
      ...prev,
      slides: [...prev.slides, { ...newSlide, id: createUniqueId() }],
    }));
    setCurrentSlideIndex((prev) => presentation.slides.length);
  };

  useEffect(() => {
    if (currentSlideIndex >= presentation.slides.length) {
      setCurrentSlideIndex(presentation.slides.length - 1);
    } else if (currentSlideIndex < 0) {
      setCurrentSlideIndex(0);
    }
  }, [presentation.slides.length]);

  const addEmptySlide = () => {
    addSlide({
      elements: [
        {
          id: 2,
          type: "title",
          content: "",
          size: "large",
          color: "#000000",
        },
        {
          id: 3,
          type: "text",
          content: "",
          size: "medium",
          color: "#000000",
        },
        {
          id: 4,
          type: "image",
          src: "",
          size: "medium",
        },
      ],
    });
  };

  const updateSlide = (slideId, updatedSlide) => {
    setPresentation((prev) => {
      return {
        ...prev,
        slides: prev.slides.map((slide) =>
          slide.id === slideId ? { ...slide, ...updatedSlide } : slide
        ),
      };
    });
  };

  const deleteSlide = (slideId) => {
    const slideToDelete = presentation.slides.find(
      (slide) => slide.id === slideId
    );
    setPresentation((prev) => ({
      ...prev,
      slides: prev.slides.filter((slide) => slide.id !== slideId),
    }));
  };

  // Element management functions
  const updateElement = (slideId, elementIndex, updatedElement) => {
    setPresentation((prev) => ({
      ...prev,
      slides: prev.slides.map((slide) => {
        if (slide.id === slideId) {
          const newElements = [...slide.elements];
          newElements[elementIndex] = {
            ...newElements[elementIndex],
            ...updatedElement,
          };
          return { ...slide, elements: newElements };
        }
        return slide;
      }),
    }));
  };

  const value = {
    presentation,
    setPresentation,
    pushState,
    popState,
    currentSlideIndex,
    setCurrentSlideIndex,
    currentSlide: presentation.slides[currentSlideIndex],
    nextSlide,
    previousSlide,
    addSlide,
    addEmptySlide,
    updateSlide,
    deleteSlide,
    updateElement,
    totalSlides: presentation.slides.length,
  };

  return (
    <PresentationContext.Provider value={value}>
      {children}
    </PresentationContext.Provider>
  );
};

export default PresentationProvider;
