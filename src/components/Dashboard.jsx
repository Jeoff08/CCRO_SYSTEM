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
        <div className="flex items-center w-full">
          <div className="w-56 shrink-0 px-3 py-3 flex items-center gap-2 border-r border-emerald-200">
            <img
              src="/461661670_1118300596319054_8742723372426556351_n.jpg"
              alt="CCRO"
              className="h-12 w-12 rounded-xl object-cover shrink-0 border-2 border-black"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 leading-tight">
                CCRO Document Locator
              </p>
              <p className="text-xs font-medium text-gray-900 leading-tight">
                Archiving Dashboard
              </p>
            </div>
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
        <aside className="w-56 shrink-0 border-r border-emerald-200 bg-white/80 backdrop-blur flex flex-col py-4">
          <nav className="flex flex-col gap-0.5 px-3 text-sm font-medium text-gray-700 flex-1">
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
          <div className="shrink-0 border-t-2 border-emerald-200 px-3 pt-4 mt-2">
            <button
              type="button"
              onClick={onLogout}
              className="w-full inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto px-4 py-6">
          <section className="max-w-6xl mx-auto bg-white rounded-3xl border border-emerald-100 shadow-sm p-5 md:p-6">
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
