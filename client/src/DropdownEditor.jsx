import React from "react";

const DropdownEditor = ({ currentSlide, updateElement }) => {
  const inputs = [
    {
      type: "title",
      label: "Title",
      maxLength: 50,
      getValue: () =>
        currentSlide.elements.find((el) => el.type === "title")?.content || "",
      updateValue: (value) =>
        updateElement(currentSlide.id, 0, { content: value }),
    },
    {
      type: "text",
      label: "Text",
      maxLength: 300,
      getValue: () =>
        currentSlide.elements.find((el) => el.type === "text")?.content || "",
      updateValue: (value) =>
        updateElement(currentSlide.id, 1, { content: value }),
    },
    {
      type: "image",
      label: "Image URL",
      getValue: () =>
        currentSlide.elements.find((el) => el.type === "image")?.src || "",
      updateValue: (value) => updateElement(currentSlide.id, 2, { src: value }),
    },
  ];

  return (
    <div className="space-y-4">
      {inputs.map((input) => (
        <div key={input.type} className="space-y-1">
          <textarea
            value={input.getValue()}
            onChange={(e) => input.updateValue(e.target.value)}
            maxLength={input.maxLength}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
            placeholder={`Enter ${input.label.toLowerCase()}`}
            style={{ color: "black" }}
          />
        </div>
      ))}
    </div>
  );
};

export default DropdownEditor;
