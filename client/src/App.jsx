import { useState, useEffect } from "react";
import { Plus, Presentation, Edit3, ChevronDown } from "lucide-react"; // Add ChevronDown icon
import "./App.css";
import Slide from "./components/Slide";
import useCommand from "./hooks/command";
import { queryPhotos } from "./services/unsplashService";
import { aiRequest } from "./services/aiService";
import { usePresentation } from "./providers/PresentationProvider";
import { useSlideCommands } from "./hooks/useSlideCommands";
import PresenterMode from "./PresenterMode";
import DropdownEditor from "./DropdownEditor";

function App() {
  const {
    presentation,
    pushState,
    popState,
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
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [isPromptDropdownVisible, setIsPromptDropdownVisible] = useState(false);

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
        aiRequest(command.sentence, currentSlide, handleToolCall).then(() =>
          pushState()
        );
      }
    }
  }, [command]);

  const [isPresenterMode, setIsPresenterMode] = useState(false);

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await aiRequest(prompt, currentSlide, handleToolCall);
    pushState();
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
      case "undo":
        popState();
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

  const handlePromptToggle = () => {
    setIsPromptVisible(!isPromptVisible);
  };

  const handlePromptClose = () => {
    setIsPromptVisible(false);
  };

  const handleDeleteSlide = (slideId) => {
    deleteSlide(slideId);
  };

  const [selectedInput, setSelectedInput] = useState("title");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const handleInputChange = (e) => {
    const { value } = e.target;
    switch (selectedInput) {
      case "title":
        updateElement(currentSlide.id, 0, { content: value });
        break;
      case "text":
        updateElement(currentSlide.id, 1, { content: value });
        break;
      case "image":
        updateElement(currentSlide.id, 2, { src: value });
        break;
      default:
        break;
    }
  };

  const getInputValue = () => {
    switch (selectedInput) {
      case "title":
        return (
          currentSlide.elements.find((el) => el.type === "title")?.content || ""
        );
      case "text":
        return (
          currentSlide.elements.find((el) => el.type === "text")?.content || ""
        );
      case "image":
        return (
          currentSlide.elements.find((el) => el.type === "image")?.src || ""
        );
      default:
        return "";
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownVisible(!isDropdownVisible);
  };

  const handleDropdownSelect = (inputType) => {
    setSelectedInput(inputType);
    setIsDropdownVisible(false);
  };

  const handlePromptDropdownToggle = () => {
    setIsPromptDropdownVisible(!isPromptDropdownVisible);
  };

  if (isPresenterMode) {
    return (
      <PresenterMode
        slides={presentation.slides}
        onClose={() => setIsPresenterMode(false)}
      />
    );
  }

  return (
    <div className="app">
      {/* toolbar menu */}
      <div className="toolbar">
        <div className="toolbar-left">
          <span className="app-name">JSON Derulo</span>
          <button onClick={addEmptySlide} className="add-button">
            <Plus />
            New Slide
          </button>
          <div className="relative">
            <button
              onClick={handleDropdownToggle}
              className="edit-button flex items-center gap-2 px-3 py-2 bg-gray-200 rounded-md border border-gray-300 hover:bg-gray-300"
            >
              <Edit3 />
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isDropdownVisible ? "rotate-180" : ""
                }`}
              />
            </button>
            {isDropdownVisible && (
              <div className="absolute left-0 top-full mt-1 w-80 bg-white rounded-md shadow-lg border border-gray-200 p-4 space-y-4 z-10">
                <DropdownEditor
                  currentSlide={currentSlide}
                  updateElement={updateElement}
                />
                <hr className="my-4 border-gray-300" />
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                  placeholder="Enter your prompt"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handlePromptSubmit}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Submit
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="toolbar-right">
          <button
            onClick={() => setIsPresenterMode(true)}
            className="present-button"
          >
            <Presentation />
            Present
          </button>
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
                currentSlide.id === slide.id ? "active" : ""
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
                <button
                  className="delete-slide-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSlide(slide.id);
                  }}
                >
                  x
                </button>
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

      {/* prompt container */}
      {/* Remove the old prompt container */}
    </div>
  );
}

export default App;
