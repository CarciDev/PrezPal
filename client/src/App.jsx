import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import "./App.css";
import Slide from "./components/Slide";
import { useLocalStorage } from "usehooks-ts";
import OpenAI from "openai";
import useCommand from "./hooks/command";

function App() {
  const { command, isPolling, stopPolling } = useCommand();

  useEffect(() => {
    stopPolling(); // temporary - to change
  }, [isPolling]);

  useEffect(() => {
    console.log(command);
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
        },
        {
          type: "text",
          content: "",
          size: "medium",
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

  const updateSlide = (field, value, additionalProps = {}) => {
    const updatedSlides = [...slides];
    const elementIndex = updatedSlides[currentSlide].elements.findIndex(
      (el) => el.type === field
    );
    if (elementIndex !== -1) {
      if (field === "image") {
        updatedSlides[currentSlide].elements[elementIndex].src = value;
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
    await handleSpecificAICall();
  };

  const handleToolCall = (toolCall) => {
    const functionArguments = JSON.parse(toolCall.function.arguments);
    switch (toolCall.function.name) {
      case "updateTitle":
        updateSlide("title", functionArguments.title);
        break;
      case "updateText":
        updateSlide("text", functionArguments.text);
        break;
      case "updateImage":
        updateSlide("image", functionArguments.imageUrl);
        break;
      default:
        console.warn("Unknown function call:", toolCall.function.name);
    }
  };

  const handleSpecificAICall = async () => {
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

      const toolCalls = completion.choices[0].message.tool_calls;
      if (!toolCalls || toolCalls.length === 0) {
        return;
      }

      for (const toolCall of toolCalls) {
        handleToolCall(toolCall);
      }

      setPrompt("");
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
