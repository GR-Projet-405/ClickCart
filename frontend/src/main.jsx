import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/global.css";
import "./styles/dashboard-shell.css";
import "./styles/showcase.css";
import "./styles/tokens.css";
import "./styles/utilities.css";

import AppRoutes from "./routes/AppRoutes";

import "./styles/reset.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </StrictMode>
);