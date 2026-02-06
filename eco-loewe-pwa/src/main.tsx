import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";

import "./styles/base/reset.css";
import "./styles/base/tokens.css";
import "./styles/base/typography.css";

import "./styles/layout/app-shell.css";
import "./styles/layout/grid.css";

import "./styles/components/buttons.css";
import "./styles/components/cards.css";
import "./styles/components/nav.css";
import "./styles/components/segmented.css";

import "./styles/pages/home.css";
import "./styles/pages/stats.css";
import "./styles/pages/shop.css";
import "./styles/pages/leaderboard.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
