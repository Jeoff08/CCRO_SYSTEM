import React, { useState } from "react";
import LoginForm from "./components/auth/LoginForm.jsx";
import Dashboard from "./components/dashboard/Dashboard.jsx";
import { useActivityLog } from "./hooks/index.js";

const VIEWS = {
  LOGIN: "login",
  DASHBOARD: "dashboard",
};

export default function App() {
  const [view, setView] = useState(VIEWS.LOGIN);
  const [user, setUser] = useState(null);
  const { activityLog, addLog, clearHistory } = useActivityLog(user);

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

  if (view === VIEWS.LOGIN) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
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
