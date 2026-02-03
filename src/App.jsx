import React, { useState } from "react";
import LandingPage from "./components/LandingPage.jsx";
import LoginForm from "./components/LoginForm.jsx";
import Dashboard from "./components/Dashboard.jsx";

const VIEWS = {
  LANDING: "landing",
  LOGIN: "login",
  DASHBOARD: "dashboard",
};

export default function App() {
  const [view, setView] = useState(VIEWS.LANDING);
  const [user, setUser] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  const addLog = (type, details) => {
    setActivityLog((prev) => [
      {
        id: crypto.randomUUID(),
        type,
        details,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  const handleLoginSuccess = (userInfo) => {
    setUser(userInfo);
    addLog("login", `User "${userInfo.username}" logged in.`);
    setView(VIEWS.DASHBOARD);
  };

  const handleLogout = () => {
    if (user) {
      addLog("logout", `User "${user.username}" logged out.`);
    }
    setUser(null);
    setView(VIEWS.LANDING);
  };

  if (view === VIEWS.LANDING) {
    return <LandingPage onStartArchiving={() => setView(VIEWS.LOGIN)} />;
  }

  if (view === VIEWS.LOGIN) {
    return (
      <LoginForm
        onBack={() => setView(VIEWS.LANDING)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <Dashboard
      user={user}
      onLogout={handleLogout}
      activityLog={activityLog}
      addLog={addLog}
    />
  );
}

