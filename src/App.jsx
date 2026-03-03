import React, { useState, useEffect } from "react";
import LoginForm from "./components/auth/LoginForm.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import PublicLocatorPage from "./components/locator/PublicLocatorPage.jsx";
import { useActivityLog } from "./hooks/index.js";

const VIEWS = {
  PUBLIC_LOCATOR: "public_locator",
  LOGIN: "login",
  DASHBOARD: "dashboard",
};

export default function App() {
  // #region agent log
  fetch("http://127.0.0.1:7835/ingest/6b9331b4-eea6-48bb-b87d-8b623c89f3e4", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e27ead" },
    body: JSON.stringify({ sessionId: "e27ead", location: "App.jsx:entry", message: "App function entered", data: {}, timestamp: Date.now(), hypothesisId: "C" }),
  }).catch(() => {});
  // #endregion
  const [view, setView] = useState(VIEWS.PUBLIC_LOCATOR);
  const [user, setUser] = useState(null);
  const { activityLog, addLog, clearHistory } = useActivityLog(user);

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7835/ingest/6b9331b4-eea6-48bb-b87d-8b623c89f3e4", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e27ead" },
      body: JSON.stringify({ sessionId: "e27ead", location: "App.jsx:mounted", message: "App mounted", data: { view: "initial" }, timestamp: Date.now(), hypothesisId: "C" }),
    }).catch(() => {});
    const t = setTimeout(() => {
      const appEl = document.getElementById("app");
      const bodyR = document.body.getBoundingClientRect();
      const appR = appEl ? appEl.getBoundingClientRect() : null;
      const bodyBg = appEl ? getComputedStyle(document.body).backgroundColor : "";
      const styleSheetCount = document.styleSheets.length;
      fetch("http://127.0.0.1:7835/ingest/6b9331b4-eea6-48bb-b87d-8b623c89f3e4", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "e27ead" },
        body: JSON.stringify({
          sessionId: "e27ead",
          location: "App.jsx:layout-css",
          message: "CSS and layout check",
          data: {
            styleSheetCount,
            bodyBg,
            bodyHeight: bodyR.height,
            bodyWidth: bodyR.width,
            appHeight: appR ? appR.height : null,
            appWidth: appR ? appR.width : null,
            appChildCount: appEl ? appEl.childElementCount : 0,
          },
          timestamp: Date.now(),
          hypothesisId: "F",
        }),
      }).catch(() => {});
    }, 100);
    return () => clearTimeout(t);
  }, []);
  // #endregion

  const handleLoginSuccess = async (userInfo) => {
    setUser(userInfo);
    setView(VIEWS.DASHBOARD);
  };

  const handleLogout = async () => {
    setUser(null);
    setView(VIEWS.PUBLIC_LOCATOR);
  };

  const handleShowLogin = () => {
    setView(VIEWS.LOGIN);
  };

  if (view === VIEWS.PUBLIC_LOCATOR) {
    return <PublicLocatorPage onLogin={handleShowLogin} addLog={addLog} />;
  }

  if (view === VIEWS.LOGIN) {
    return (
      <LoginForm
        onLoginSuccess={handleLoginSuccess}
        onBackToLocator={() => setView(VIEWS.PUBLIC_LOCATOR)}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      activityLog={activityLog}
      addLog={addLog}
      clearHistory={clearHistory}
    />
  );
}
