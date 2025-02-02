import React, { useState, useEffect } from "react";
import Slide from "./components/Slide";

const PresenterMode = ({ slides, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleClose = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.webkitFullscreenElement) {
        await document.webkitExitFullscreen();
      } else if (document.mozFullScreenElement) {
        await document.mozCancelFullScreen();
      } else if (document.msFullscreenElement) {
        await document.msExitFullscreen();
      }

      setTimeout(() => {
        onClose();
      }, 50);
    } catch (err) {
      console.error("Error exiting fullscreen:", err);
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case "ArrowRight":
        case "Space":
          setCurrentSlideIndex((prev) =>
            prev < slides.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowLeft":
          setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "Escape":
          handleClose();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [slides.length, onClose]);

  useEffect(() => {
    const enterFullscreen = () => {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
    };

    setTimeout(enterFullscreen, 100);

    return () => {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    };
  }, []);

  return (
    <div className="presenter-mode-container">
      <div className="slide landscape">
        <Slide
          elements={slides[currentSlideIndex].elements}
          layout={slides[currentSlideIndex].layout}
        />
      </div>
      <div className="fixed bottom-4 right-4 text-white text-lg">
        {currentSlideIndex + 1} / {slides.length}
      </div>
    </div>
  );
};

export default PresenterMode;
