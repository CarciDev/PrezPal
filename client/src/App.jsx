import { useState } from "react";
import { Plus } from "lucide-react";
import "./App.css";
import Slide from "./components/Slide";

function App() {
  const [slides, setSlides] = useState([
    {
      id: 1,
      layout: "titleTextImage",
      title: "",
      text: "",
      imageUrl: "",
    },
  ]);

  const [currentSlide, setCurrentSlide] = useState(0);

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

  const handleImageError = (e) => {
    e.target.src = "path/to/placeholder-image.jpg";
  };

  return (
    <div className="app">
      {/* toolbar menu */}
      <div className="toolbar">
        <h2>JSON Derulo</h2>
        <button onClick={addSlide} className="add-button">
          <Plus />
          New Slide
        </button>
        <div className="inputs">
          <input
            type="text"
            value={slides[currentSlide].title}
            onChange={(e) => updateSlide("title", e.target.value)}
            placeholder="Title"
          />
          <input
            type="text"
            value={slides[currentSlide].text}
            onChange={(e) => updateSlide("text", e.target.value)}
            placeholder="Text content"
          />
          <input
            type="text"
            value={slides[currentSlide].imageUrl}
            onChange={(e) => updateSlide("imageUrl", e.target.value)}
            placeholder="Image URL"
          />
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
