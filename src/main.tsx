import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppKitProvider } from "./components/app-kit-provider.tsx";
import { HomePage } from "./pages/home/index.tsx";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppKitProvider>
      <HomePage />
    </AppKitProvider>
  </StrictMode>
);
