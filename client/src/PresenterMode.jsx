import React, { useState, useEffect } from "react";
import Slide from "./components/Slide";

const PresenterMode = ({ slides, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const isInFullscreen = () => {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  };

  const exitFullscreen = async () => {
    try {
      if (!isInFullscreen()) return;

      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        await document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (err) {
      console.error("Error exiting fullscreen:", err);
    }
  };

  const handleClose = async () => {
    if (isExiting) return;
    setIsExiting(true);

    try {
      await exitFullscreen();
      // Wait a short moment to ensure fullscreen has exited
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (err) {
      console.error("Error during close:", err);
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
  }, [slides.length]);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          await elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
      } catch (err) {
        console.error("Error entering fullscreen:", err);
      }
    };

    // Small delay to ensure component is mounted
    const timer = setTimeout(enterFullscreen, 100);

    return () => {
      clearTimeout(timer);
      if (!isExiting) {
        exitFullscreen().catch(console.error);
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
