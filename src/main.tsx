import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { Providers } from "./components/providers";
import { HomePage } from "./pages/home";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <HomePage />
    </Providers>
  </StrictMode>
);
