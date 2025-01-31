import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./colors.css";
import "./index.css";
import "./button.css";
import "./assets/fonts/Gabarito-VariableFont_wght.ttf";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);