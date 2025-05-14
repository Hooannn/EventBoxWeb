import { HeroUIProvider } from "@heroui/react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./libs/i18n";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HeroUIProvider>
    <App />
  </HeroUIProvider>
);
