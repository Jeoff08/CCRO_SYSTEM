import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage.jsx";
import LoginForm from "./components/LoginForm.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { authAPI, activityLogsAPI } from "./api.js";

const VIEWS = {
  LANDING: "landing",
  LOGIN: "login",
  DASHBOARD: "dashboard",
};

export default function App() {
  const [view, setView] = useState(VIEWS.LANDING);
  const [user, setUser] = useState(null);
  const [activityLog, setActivityLog] = useState([]);

  // Load activity logs on mount
  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = async () => {
    try {
      const logs = await activityLogsAPI.getAll(100);
      setActivityLog(logs);
    } catch (error) {
      console.error("Failed to load activity logs:", error);
    }
  };

  const addLog = async (type, details, searchCode = null) => {
    try {
      const logData = {
        userId: user?.id || null,
        username: user?.username || null,
        type,
        details: typeof details === "string" ? details : details,
        searchCode,
      };

      const newLog = await activityLogsAPI.create(logData);
      setActivityLog((prev) => [newLog, ...prev]);
    } catch (error) {
      console.error("Failed to create activity log:", error);
      // Fallback to local state if API fails
      setActivityLog((prev) => [
        {
          id: crypto.randomUUID(),
          type,
          details,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  };

  const handleLoginSuccess = async (userInfo) => {
    setUser(userInfo);
    await addLog("login", `User "${userInfo.username}" logged in.`);
    setView(VIEWS.DASHBOARD);
  };

  const handleLogout = async () => {
    if (user) {
      await addLog("logout", `User "${user.username}" logged out.`);
    }
    setUser(null);
    setView(VIEWS.LOGIN);
  };

  const clearHistory = async () => {
    try {
      await activityLogsAPI.clearAll();
      setActivityLog([]);
    } catch (error) {
      console.error("Failed to clear activity logs:", error);
    }
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
      clearHistory={clearHistory}
    />
  );
}

