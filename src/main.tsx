import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Force dark mode
document.documentElement.classList.add('dark');

createRoot(document.getElementById("root")!).render(<App />);

// Register Service Worker for PWA
registerSW({ immediate: true });
