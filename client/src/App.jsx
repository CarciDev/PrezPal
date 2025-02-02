import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import "./App.css";
import Slide from "./components/Slide";
import useCommand from "./hooks/command";
import { queryPhotos } from "./services/unsplashService";
import { aiRequest } from "./services/aiService";
import { usePresentation } from "./providers/PresentationProvider";
import { useSlideCommands } from "./hooks/useSlideCommands";

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
  } = usePresentation();

  const { command, isPolling, startPolling } = useCommand();

  const [slides, setSlides] = useLocalStorage("slides", [
    {
      layout: "titleTextImage",
      id: 1,
      elements: [
        {
          type: "title",
          content: "Welcome to the Presentation",
          size: "large",
          color: "#000000",
        },
        {
          type: "text",
          content: "",
          size: "medium",
          color: "#000000",
        },
        {
          type: "image",
          src: "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
          size: "medium",
        },
      ],
    },
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [prompt, setPrompt] = useState("");

  const updateSlide = async (field, value, additionalProps = {}) => {
    const updatedSlides = [...slides];
    const elementIndex = updatedSlides[currentSlide].elements.findIndex(
      (el) => el.type === field
    );
    if (elementIndex !== -1) {
      if (field === "image") {
        const photos = await queryPhotos(value);
        if (photos.length === 0) {
          return;
        }
        updatedSlides[currentSlide].elements[elementIndex].src = photos[0].src;
      } else {
        updatedSlides[currentSlide].elements[elementIndex].content = value;
      }
      updatedSlides[currentSlide].elements[elementIndex] = {
        ...updatedSlides[currentSlide].elements[elementIndex],
        ...additionalProps,
      };
    } else {
      updatedSlides[currentSlide].elements.push({
        type: field,
        content: field === "image" ? "" : value,
        src: field === "image" ? value : "",
        ...additionalProps,
      });
    }
    setSlides(updatedSlides);
  };

  const addSlide = () => {
    console.log(slides);
    setSlides([
      ...slides,
      {
        id: slides.length + 1,
        elements: [],
      },
    ]);
    setCurrentSlide(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length <= 1) {
      return;
    }

    const updatedSlides = slides.filter((_, index) => index !== currentSlide);
    setSlides(updatedSlides);
    if (currentSlide === slides.length - 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const setTitle = (title, color, size) => {
    updateSlide("title", title, { color, size });
  };

  const setText = (text, color, size) => {
    updateSlide("text", text, { color, size });
  };

  const setImage = (imageUrl, size) => {
    updateSlide("image", imageUrl, { size });
  };

  const slideActions = {
    addSlide,
    setCurrentSlide,
    totalSlides: slides.length,
    deleteSlide,
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
        aiRequest(command.sentence);
      }
    }
  }, [command]);

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

  return (
    <div className="app">
      {/* toolbar menu */}
      <div className="toolbar">
        <button
          onClick={() =>
            addSlide({
              layout: "titleTextImage",
              elements: [
                {
                  id: 2,
                  type: "title",
                  content: "New Slide",
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
            })
          }
          className="add-button"
        >
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
              <h3>
                {slide.elements.find((el) => el.type === "title")?.content ||
                  (slide.elements.length === 0 ? "Untitled Slide" : "")}
              </h3>
              <p>{slide.elements.find((el) => el.type === "text")?.content}</p>
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
