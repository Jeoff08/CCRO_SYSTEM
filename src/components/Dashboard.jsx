import React, { useState, useEffect } from "react";
import DocumentLocator from "./DocumentLocator.jsx";
import BoxManagement from "./BoxManagement.jsx";

const BOXES_STORAGE_KEY = "ccro-archive-boxes";

function loadBoxesFromStorage() {
  try {
    const raw = localStorage.getItem(BOXES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBoxesToStorage(boxes) {
  try {
    localStorage.setItem(BOXES_STORAGE_KEY, JSON.stringify(boxes));
  } catch {
    // ignore
  }
}

const TABS = {
  DASHBOARD: "dashboard",
  BOXES: "boxes",
  LOCATOR: "locator",
};

const SIDEBAR_ITEMS = [
  {
    id: TABS.DASHBOARD,
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    id: TABS.BOXES,
    label: "Box Management",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    id: TABS.LOCATOR,
    label: "Document Locator",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

export default function Dashboard({ user, onLogout, activityLog, addLog }) {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [boxes, setBoxes] = useState(() => loadBoxesFromStorage());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    saveBoxesToStorage(boxes);
  }, [boxes]);

  const handleAddBox = (box) => {
    setBoxes((prev) => [...prev, box]);
  };

  const handleUpdateBox = (updated) => {
    setBoxes((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-emerald-200 bg-white/80 backdrop-blur">
        <div className="flex items-center w-full">
          <div
            className={`shrink-0 border-r border-emerald-200 flex items-center transition-all duration-200 ${
              sidebarOpen ? "w-56 px-3 py-3 gap-2" : "w-16 justify-center py-3"
            }`}
          >
            <img
              src="/461661670_1118300596319054_8742723372426556351_n.jpg"
              alt="CCRO"
              className={`rounded-xl object-cover shrink-0 border-2 border-black transition-all ${
                sidebarOpen ? "h-12 w-12" : "h-10 w-10"
              }`}
            />
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 leading-tight">
                  CCRO Document Locator
                </p>
                <p className="text-xs font-[600] text-gray-900 text-center mt-2 leading-tight">
                  Archiving
                </p>
              </div>
            )}
          </div>
          
          <div className="flex-1 px-4 py-3 flex items-center justify-end gap-3 min-w-0">
            {user && (
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-900">
                  {user.username}
                </p>
                <p className="text-[11px] text-gray-500">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        <aside
          className={`shrink-0 border-r border-emerald-200 bg-white/80 backdrop-blur flex flex-col py-4 transition-all duration-200 ${
            sidebarOpen ? "w-56" : "w-16"
          }`}
        >
          <div className={`flex ${sidebarOpen ? "justify-end px-3" : "justify-center"} mb-2`}>
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-2 rounded-lg text-gray-500 hover:bg-emerald-50 hover:text-emerald-700 transition"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <svg
                className={`w-5 h-5 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M8 6v12" />
              </svg>
            </button>
          </div>
          <nav className="flex flex-col gap-1 px-3 text-sm font-medium text-gray-700 flex-1 items-stretch">
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarItem
                key={item.id}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
                icon={item.icon}
                label={item.label}
                collapsed={!sidebarOpen}
              />
            ))}
          </nav>
          <div className="shrink-0 border-t-2 border-emerald-200 px-3 pt-4 mt-2">
            <button
              type="button"
              onClick={onLogout}
              className={`w-full inline-flex items-center justify-center rounded-lg border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50 transition ${
                sidebarOpen ? "px-3 py-2 text-xs font-semibold rounded-full" : "p-2"
              }`}
              title="Logout"
            >
              {sidebarOpen ? (
                "Logout"
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto px-4 py-6 min-w-0">
          <section
            className="w-full mx-auto bg-white rounded-3xl border border-emerald-100 shadow-sm p-5 md:p-6"
            style={{ maxWidth: "min(80rem, calc(100vw - 18rem))" }}
          >
            {activeTab === TABS.DASHBOARD && (
              <DashboardHome activityLog={activityLog} boxes={boxes} />
            )}
            {activeTab === TABS.BOXES && (
              <BoxManagement
                boxes={boxes}
                onAdd={handleAddBox}
                onUpdate={handleUpdateBox}
                addLog={addLog}
              />
            )}
            {activeTab === TABS.LOCATOR && (
              <DocumentLocator boxes={boxes} addLog={addLog} />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function DashboardHome({ activityLog, boxes }) {
  const recentEvents = activityLog.slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
          <p className="text-sm text-gray-600">
            Recent events and activity across the archive system.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <div className="space-y-4">
          <div className="border border-emerald-100 rounded-2xl bg-emerald-50/60 p-4 md:p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="bg-white border border-emerald-100 rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">Registered Boxes</p>
                <p className="text-2xl font-bold text-gray-900">{boxes.length}</p>
              </div>
            </div>
          </div>
          <div className="border border-emerald-100 rounded-2xl bg-emerald-50/60 p-4 md:p-5 max-h-[28rem] overflow-y-auto custom-scrollbar">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Activity Log</h3>
            {activityLog.length === 0 ? (
              <p className="text-xs text-gray-500">
                No activity recorded yet. Actions performed in the locator and box
                modules will appear here.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {activityLog.map((entry) => (
                  <li
                    key={entry.id}
                    className="bg-white border border-emerald-100 rounded-xl px-3 py-2.5 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        {formatActivityType(entry.type)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatActivityTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-800">
                      {typeof entry.details === "string"
                        ? entry.details
                        : entry.details?.message ?? ""}
                    </p>
                    {typeof entry.details === "object" &&
                      entry.details?.searchCode && (
                        <p className="font-mono text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 mt-0.5">
                          {entry.details.searchCode}
                        </p>
                      )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatActivityType(type) {
  switch (type) {
    case "login":
      return "User Login";
    case "logout":
      return "User Logout";
    case "search":
      return "Search Executed";
    case "box-add":
      return "Box Created";
    case "box-edit":
      return "Box Edited";
    default:
      return type;
  }
}

function formatActivityTimestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SidebarItem({ active, onClick, icon, label, collapsed }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex items-center rounded-lg transition ${
        collapsed
          ? "w-full justify-center p-2.5"
          : "w-full justify-start px-3 py-2.5 gap-2"
      } ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-emerald-50"
      }`}
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </button>
  );
}
