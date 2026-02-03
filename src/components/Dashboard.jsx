import React, { useState, useEffect } from "react";
import DocumentLocator from "./DocumentLocator.jsx";
import BoxManagement from "./BoxManagement.jsx";
import ActivityLog from "./ActivityLog.jsx";

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
  BOXES: "boxes",
  LOCATOR: "locator",
  LOGS: "logs",
};

const SIDEBAR_ITEMS = [
  { id: TABS.BOXES, label: "Box Management" },
  { id: TABS.LOCATOR, label: "Document Locator" },
  { id: TABS.LOGS, label: "Activity Log" },
];

export default function Dashboard({ user, onLogout, activityLog, addLog }) {
  const [activeTab, setActiveTab] = useState(TABS.BOXES);
  const [boxes, setBoxes] = useState(() => loadBoxesFromStorage());

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
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-700">
              CCRO Document Locator
            </p>
            <p className="text-sm font-medium text-gray-900">
              Archiving Dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-900">
                  {user.username}
                </p>
                <p className="text-[11px] text-gray-500">{user.role}</p>
              </div>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        <aside className="w-56 shrink-0 border-r border-emerald-200 bg-white/80 backdrop-blur flex flex-col py-4">
          <nav className="flex flex-col gap-0.5 px-3 text-sm font-medium text-gray-700">
            {SIDEBAR_ITEMS.map((item) => (
              <SidebarItem
                key={item.id}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </SidebarItem>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto px-4 py-6">
          <section className="max-w-4xl mx-auto bg-white rounded-3xl border border-emerald-100 shadow-sm p-5 md:p-6">
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
            {activeTab === TABS.LOGS && <ActivityLog activityLog={activityLog} />}
          </section>
        </main>
      </div>
    </div>
  );
}

function SidebarItem({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition ${
        active
          ? "bg-emerald-600 text-white shadow-sm"
          : "text-gray-600 hover:bg-emerald-50"
      }`}
    >
      {children}
    </button>
  );
}
