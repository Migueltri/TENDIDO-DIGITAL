import { StrictMode } from "react";
import { inject } from '@vercel/analytics';
inject();
import { createRoot } from "react-dom/client";
import "./i18n";
import "./index.css";
import App from "./App"; // importa tu componente principal

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
