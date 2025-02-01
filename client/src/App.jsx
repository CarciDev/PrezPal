import { useState } from "react";
import { Plus } from "lucide-react";
import "./App.css";
import Slide from "./components/Slide";
import { useLocalStorage } from "usehooks-ts";
import OpenAI from "openai";

function App() {
  const [slides, setSlides] = useLocalStorage("slides", [
    {
      id: 1,
      layout: "titleTextImage",
      title: "",
      text: "",
      imageUrl: "",
    },
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

  const [prompt, setPrompt] = useState("");
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [activeFunction, setActiveFunction] = useState(null);

  const updateSlide = (field, value) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlide] = {
      ...updatedSlides[currentSlide],
      [field]: value,
    };
    setSlides(updatedSlides);
  };

  const addSlide = () => {
    setSlides([
      ...slides,
      {
        id: slides.length + 1,
        layout: "titleTextImage",
        title: "",
        text: "",
        imageUrl: "",
      },
    ]);
    setCurrentSlide(slides.length);
  };

  const setTitle = (title) => {
    updateSlide("title", title);
  };

  const setText = (text) => {
    updateSlide("text", text);
  };

  const setImage = (imageUrl) => {
    updateSlide("imageUrl", imageUrl);
  };

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    await handleSpecificAICall(activeFunction);
    setShowPromptInput(false);
    setActiveFunction(null);
  };

  const openPromptInput = (functionType) => {
    setActiveFunction(functionType);
    setShowPromptInput(true);
    setPrompt("");
  };

  const handleToolCall = (toolCall) => {
    if (!toolCall) return;

    const functionArgs = JSON.parse(toolCall.function.arguments);

    switch (toolCall.function.name) {
      case "updateTitle":
        updateSlide("title", functionArgs.title);
        break;
      case "updateText":
        updateSlide("text", functionArgs.text);
        break;
      case "updateImage":
        updateSlide("imageUrl", functionArgs.imageUrl);
        break;
      default:
        console.warn("Unknown function call:", toolCall.function.name);
    }
  };

  const handleSpecificAICall = async (functionType) => {
    if (!prompt.trim()) {
      alert("Please enter a prompt first!");
      return;
    }

    const tools = [
      {
        type: "function",
        function: {
          name: "updateTitle",
          description: "Update the content of the current slide's title",
          parameters: {
            type: "object",
            properties: {
              title: {
                type: "string",
                description: "The title of the slide",
              },
            },
            required: ["title"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
      {
        type: "function",
        function: {
          name: "updateText",
          description: "Update the content of the current slide's text",
          parameters: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "The main text content of the slide",
              },
            },
            required: ["text"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
      {
        type: "function",
        function: {
          name: "updateImage",
          description: "Update the content of the current slide's image",
          parameters: {
            type: "object",
            properties: {
              imageUrl: {
                type: "string",
                description: "URL for an image to display on the slide",
              },
            },
            required: ["imageUrl"],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    ];
    try {
      const client = new OpenAI({
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true,
      });

      // First API call to get function call
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a helpful presentation assistant. Generate appropriate slide content based on the current slide. Here is the request to service: ${prompt}`,
          },
          {
            role: "user",
            content: JSON.stringify(slides[currentSlide]),
          },
        ],
        tools: tools,
      });

      const toolCall = completion.choices[0].message.tool_calls?.[0];
      if (toolCall) {
        const functionArgs = JSON.parse(toolCall.function.arguments);
        console.log(toolCall);
        console.log(functionArgs);

        switch (functionType) {
          case "title":
            updateSlide("title", functionArgs.title);
            break;
          case "text":
            updateSlide("text", functionArgs.text);
            break;
          case "image":
            updateSlide("imageUrl", functionArgs.imageUrl);
            break;
        }
        setPrompt("");
      }
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      alert("Error generating content. Please check the console for details.");
    }
  };

  const handleImageError = (e) => {
    e.target.src = "path/to/placeholder-image.jpg";
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
              value={slides[currentSlide].title}
              onChange={(e) => updateSlide("title", e.target.value)}
              placeholder="Title"
              maxLength={50}
            />
            {activeFunction === "title" && (
              <div className="prompt-input-container">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter prompt for title..."
                  className="prompt-input"
                />
                <button
                  onClick={() => handleSpecificAICall("title")}
                  className="add-button"
                  disabled={!prompt.trim()}
                >
                  Generate
                </button>
              </div>
            )}
            <button
              onClick={() =>
                setActiveFunction(activeFunction === "title" ? null : "title")
              }
              className="small-button"
            >
              Update Title
            </button>
          </div>

          <div className="input-group">
            <input
              type="text"
              value={slides[currentSlide].text}
              onChange={(e) => updateSlide("text", e.target.value)}
              placeholder="Text content"
              maxLength={300}
            />
            {activeFunction === "text" && (
              <div className="prompt-input-container">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter prompt for text..."
                  className="prompt-input"
                />
                <button
                  onClick={() => handleSpecificAICall("text")}
                  className="add-button"
                  disabled={!prompt.trim()}
                >
                  Generate
                </button>
              </div>
            )}
            <button
              onClick={() =>
                setActiveFunction(activeFunction === "text" ? null : "text")
              }
              className="small-button"
            >
              Update Text
            </button>
          </div>

          <div className="input-group">
            <input
              type="text"
              value={slides[currentSlide].imageUrl}
              onChange={(e) => updateSlide("imageUrl", e.target.value)}
              placeholder="Image URL"
            />
            {activeFunction === "image" && (
              <div className="prompt-input-container">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter prompt for image..."
                  className="prompt-input"
                />
                <button
                  onClick={() => handleSpecificAICall("image")}
                  className="add-button"
                  disabled={!prompt.trim()}
                >
                  Generate
                </button>
              </div>
            )}
            <button
              onClick={() =>
                setActiveFunction(activeFunction === "image" ? null : "image")
              }
              className="small-button"
            >
              Update Image
            </button>
          </div>
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
                {slide.title ||
                  (slide.text || slide.imageUrl ? "" : "Untitled Slide")}
              </h3>
              <p>{slide.text}</p>
            </div>
          ))}
        </div>

        {/* slide preview */}
        <div className="slide-preview">
          <div className="slide landscape">
            <Slide
              layout={slides[currentSlide].layout}
              title={slides[currentSlide].title}
              text={slides[currentSlide].text}
              image={slides[currentSlide].imageUrl}
              onImageError={handleImageError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
