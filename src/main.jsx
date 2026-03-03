import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import "./style.css";

// #region agent log
fetch("http://127.0.0.1:7835/ingest/6b9331b4-eea6-48bb-b87d-8b623c89f3e4", {
  method: "POST",
  headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e27ead" },
  body: JSON.stringify({ sessionId: "e27ead", location: "main.jsx:before-render", message: "main.jsx executing", data: {}, timestamp: Date.now(), hypothesisId: "D" }),
}).catch(() => {});
// #endregion

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

