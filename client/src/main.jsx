import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import PresentationProvider from "./providers/PresentationProvider";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PresentationProvider>
      <App />
    </PresentationProvider>
  </StrictMode>
);
