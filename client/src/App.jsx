import { useState, useEffect } from "react";
import { Plus, Presentation } from "lucide-react";
import "./App.css";
import Slide from "./components/Slide";
import useCommand from "./hooks/command";
import { queryPhotos } from "./services/unsplashService";
import { aiRequest } from "./services/aiService";
import { usePresentation } from "./providers/PresentationProvider";
import { useSlideCommands } from "./hooks/useSlideCommands";
import PresenterMode from "./PresenterMode";

function App() {
  const {
    presentation,
    currentSlide,
    setCurrentSlideIndex,
    updateSlide,
    updateElement,
    deleteSlide,
    nextSlide,
    previousSlide,
    addSlide,
    addEmptySlide,
  } = usePresentation();

  const { command, isPolling, startPolling } = useCommand();

  const [prompt, setPrompt] = useState("");

  const deleteCurrentSlide = () => {
    deleteSlide(currentSlide.id);
  };

  const slideActions = {
    addEmptySlide,
    setCurrentSlideIndex,
    totalSlides: presentation.slides.length,
    deleteCurrentSlide,
  };
  const { processCommand } = useSlideCommands(slideActions);

  useEffect(() => {
    if (!isPolling) {
      startPolling();
    }
  }, [isPolling]);

  useEffect(() => {
    console.log(command);
    if (command?.sentence) {
      const wasVoiceCommand = processCommand(command);
      if (!wasVoiceCommand) {
        // aiRequest(command.sentence);
      }
    }
  }, [command]);

  const [isPresenterMode, setIsPresenterMode] = useState(false);

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await aiRequest(prompt, currentSlide, handleToolCall);
    setPrompt("");
  };

  const handleToolCall = async (toolCall) => {
    const functionArguments = JSON.parse(toolCall.function.arguments);
    switch (toolCall.function.name) {
      case "updateTitle":
        updateElement(currentSlide.id, 0, {
          content: functionArguments.title,
          color: functionArguments.color,
        });
        break;
      case "updateText":
        updateElement(currentSlide.id, 1, {
          content: functionArguments.text,
          color: functionArguments.color,
        });
        break;
      case "updateImage":
        const photoQuery = await queryPhotos(functionArguments.photoQuery);
        const photo = photoQuery[0];
        updateElement(currentSlide.id, 2, {
          src: photo.src,
          alt: photo.alt,
        });
        break;
      default:
        console.warn("Unknown function call:", toolCall.function.name);
    }
  };

  const handleImageError = (e) => {
    // Todo
  };

  const getTitleClassName = (title) => {
    return title.length > 50 ? "small" : "";
  };

  if (isPresenterMode) {
    return (
      <PresenterMode
        slides={slides}
        onClose={() => setIsPresenterMode(false)}
      />
    );
  }

  return (
    <div className="app">
      {/* toolbar menu */}
      <div className="toolbar">
        <button onClick={addEmptySlide} className="add-button">
          <Plus />
          New Slide
        </button>
        <div className="inputs">
          <div className="input-group">
            <input
              type="text"
              value={
                currentSlide.elements.find((el) => el.type === "title")
                  ?.content || ""
              }
              onChange={(e) =>
                updateElement(currentSlide.id, 0, { content: e.target.value })
              }
              placeholder="Title"
              maxLength={50}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              value={
                currentSlide.elements.find((el) => el.type === "text")
                  ?.content || ""
              }
              onChange={(e) =>
                updateElement(currentSlide.id, 1, { content: e.target.value })
              }
              placeholder="Text content"
              maxLength={300}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              value={
                currentSlide.elements.find((el) => el.type === "image")?.src ||
                ""
              }
              onChange={(e) =>
                updateElement(currentSlide.id, 2, { src: e.target.value })
              }
              placeholder="Image URL"
            />
          </div>
        </div>
        <button
          onClick={() => setIsPresenterMode(true)}
          className="present-button"
        >
          <Presentation />
          Present
        </button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <button onClick={handlePromptSubmit}>Submit</button>
        </div>
      </div>

      {/* content */}
      <div className="main-content">
        {/* sidebar */}
        <div className="sidebar">
          {presentation.slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => setCurrentSlideIndex(index)}
              className={`slide-thumbnail ${
                currentSlide === index ? "active" : ""
              }`}
            >
              <div className="slide-number-container">
                <span className="slide-number">{index + 1}</span>
                <div className="slide-content">
                  <h3
                    className={`slide-title ${getTitleClassName(
                      slide.elements.find((el) => el.type === "title")
                        ?.content || ""
                    )}`}
                  >
                    {slide.elements.find((el) => el.type === "title")
                      ?.content || "Untitled Slide"}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* slide preview */}
        <div className="slide-preview">
          <div className="slide landscape">
            <Slide
              elements={currentSlide.elements}
              onImageError={handleImageError}
              layout={currentSlide.layout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
