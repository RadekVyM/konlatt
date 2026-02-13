import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./css/colors.css";
import "./css/animations.css";
import "./css/index.css";
import "./css/button.css";
import "./assets/fonts/Gabarito-VariableFont_wght.ttf";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);