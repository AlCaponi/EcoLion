import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app/App";
// register basic global error handlers to capture runtime errors during dev
if (typeof window !== "undefined") {
  window.addEventListener("error", (ev) => {
    // eslint-disable-next-line no-console
    console.error("Global error:", ev.error ?? ev.message, ev);
  });
  window.addEventListener("unhandledrejection", (ev) => {
    // eslint-disable-next-line no-console
    console.error("Unhandled promise rejection:", ev.reason ?? ev);
  });
}

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
import "./styles/pages/rewards.css";
import "./styles/pages/settings.css";
import "./styles/pages/auth.css";

import { SettingsProvider } from "./shared/context/SettingsContext"; // Ensure correct path

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SettingsProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SettingsProvider>
  </React.StrictMode>
);
