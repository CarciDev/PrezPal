import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import "./App.css";
import Slide from "./components/Slide";
import { useLocalStorage } from "usehooks-ts";
import useCommand from "./hooks/command";
import { queryPhotos } from "./services/unsplashService";
import { aiRequest } from "./services/aiService";

function App() {
  const { command, isPolling, startPolling } = useCommand();

  useEffect(() => {
    if (!isPolling) {
      startPolling();
    }
  }, [isPolling]);

  useEffect(() => {
    console.log(command);
    if (command) {
      //   aiRequest(command.sentence, slides[currentSlide]); // commented-out as there are no safeguards in place to prevent excessive calls
    }
  }, [command]);

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

  const setTitle = (title, color, size) => {
    updateSlide("title", title, { color, size });
  };

  const setText = (text, color, size) => {
    updateSlide("text", text, { color, size });
  };

  const setImage = (imageUrl, size) => {
    updateSlide("image", imageUrl, { size });
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await aiRequest(prompt, slides[currentSlide]);
    setPrompt("");
  };

  const handleToolCall = (toolCall) => {
    const functionArguments = JSON.parse(toolCall.function.arguments);
    switch (toolCall.function.name) {
      case "updateTitle":
        updateSlide("title", functionArguments.title, {
          color: functionArguments.color,
        });
        break;
      case "updateText":
        updateSlide("text", functionArguments.text, {
          color: functionArguments.color,
        });
        break;
      case "updateImage":
        updateSlide("image", functionArguments.photoQuery);
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
        <button onClick={addSlide} className="add-button">
          <Plus />
          New Slide
        </button>
        <div className="inputs">
          <div className="input-group">
            <input
              type="text"
              value={
                slides[currentSlide].elements.find((el) => el.type === "title")
                  ?.content || ""
              }
              onChange={(e) => updateSlide("title", e.target.value)}
              placeholder="Title"
              maxLength={50}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              value={
                slides[currentSlide].elements.find((el) => el.type === "text")
                  ?.content || ""
              }
              onChange={(e) => updateSlide("text", e.target.value)}
              placeholder="Text content"
              maxLength={300}
            />
          </div>

          <div className="input-group">
            <input
              type="text"
              value={
                slides[currentSlide].elements.find((el) => el.type === "image")
                  ?.src || ""
              }
              onChange={(e) => updateSlide("image", e.target.value)}
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
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => setCurrentSlide(index)}
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
              elements={slides[currentSlide].elements}
              onImageError={handleImageError}
              layout={slides[currentSlide].layout}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
