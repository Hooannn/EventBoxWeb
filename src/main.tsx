import { HeroUIProvider } from "@heroui/react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./libs/i18n";
import { ToastProvider } from "@heroui/toast";
import App from "./App";

import { FabricObject } from "fabric";

declare module "fabric" {
  // to have the properties recognized on the instance and in the constructor
  interface FabricObject {
    id?: string;
    name?: string;
  }
  // to have the properties typed in the exported object
  interface SerializedObjectProps {
    id?: string;
    name?: string;
  }
}

// to actually have the properties added to the serialized object
FabricObject.customProperties = [
  "id",
  "shapeId",
  "areaType",
  "ticketTypeId",
  "customLabel",
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HeroUIProvider>
    <ToastProvider />
    <App />
  </HeroUIProvider>
);
