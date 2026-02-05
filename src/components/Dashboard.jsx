import React, { useState, useEffect } from "react";
import DocumentLocator from "./DocumentLocator.jsx";
import BoxManagement from "./BoxManagement.jsx";
import LocationManagement, { DEFAULT_ROW_LABELS, DEFAULT_SHELF_LETTERS_BY_BAY } from "./LocationManagement.jsx";

const BOXES_STORAGE_KEY = "ccro-archive-boxes";
const LOCATION_PROFILES_KEY = "ccro-location-profiles";
const ACTIVE_LOCATION_PROFILE_KEY = "ccro-location-profile-active";

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

function loadLocationProfilesFromStorage() {
  try {
    const raw = localStorage.getItem(LOCATION_PROFILES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function loadActiveLocationProfileIdFromStorage() {
  try {
    return localStorage.getItem(ACTIVE_LOCATION_PROFILE_KEY) || "";
  } catch {
    return "";
  }
}

const TABS = {
  DASHBOARD: "dashboard",
  BOXES: "boxes",
  LOCATOR: "locator",
  LOCATIONS: "locations",
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
  {
    id: TABS.LOCATIONS,
    label: "Location Management",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12m0 0a4 4 0 10-5.657 5.657 4 4 0 005.657-5.657zM13.414 12l2.829-2.829a4 4 0 00-5.657-5.657L7.757 6.343" />
      </svg>
    ),
  },
];

export default function Dashboard({ user, onLogout, activityLog, addLog }) {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [boxes, setBoxes] = useState(() => loadBoxesFromStorage());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [locationProfiles, setLocationProfiles] = useState(() => {
    const loaded = loadLocationProfilesFromStorage();
    if (loaded && loaded.length) return loaded;
    return [
      {
        id: crypto.randomUUID(),
        name: "Default mapping",
        shelfLettersByBay: DEFAULT_SHELF_LETTERS_BY_BAY,
        rowLabels: DEFAULT_ROW_LABELS,
        updatedAt: new Date().toISOString(),
      },
    ];
  });
  const [activeLocationProfileId, setActiveLocationProfileId] = useState(() => loadActiveLocationProfileIdFromStorage());

  useEffect(() => {
    saveBoxesToStorage(boxes);
  }, [boxes]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCATION_PROFILES_KEY, JSON.stringify(locationProfiles));
    } catch {
      // ignore
    }
  }, [locationProfiles]);

  useEffect(() => {
    try {
      localStorage.setItem(ACTIVE_LOCATION_PROFILE_KEY, activeLocationProfileId || "");
    } catch {
      // ignore
    }
  }, [activeLocationProfileId]);

  const activeLocationProfile =
    locationProfiles.find((p) => p.id === activeLocationProfileId) || locationProfiles[0];

  useEffect(() => {
    if (!activeLocationProfileId && locationProfiles.length) {
      setActiveLocationProfileId(locationProfiles[0].id);
    }
  }, [activeLocationProfileId, locationProfiles]);

  const handleAddBox = (box) => {
    setBoxes((prev) => [...prev, box]);
  };

  const handleUpdateBox = (updated) => {
    setBoxes((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-100">
      <header className="border-b border-emerald-200 bg-gradient-to-r from-emerald-100 via-sky-100 to-emerald-50/90 backdrop-blur-sm shadow-sm">
        <div className="flex items-center w-full">
          <div
            className={`shrink-0 border-r border-emerald-200 flex items-center transition-all duration-200 ${
              sidebarOpen ? "w-56 px-3 py-3 gap-2" : "w-16 justify-center py-3"
            }`}
          >
            <img
              src="/461661670_1118300596319054_8742723372426556351_n.jpg"
              alt="CCRO"
              className={`rounded-full object-cover shrink-0 border-2 border-emerald-600 transition-all ${
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
          className={`shrink-0 border-r border-emerald-200 bg-gradient-to-b from-emerald-50 via-sky-50 to-emerald-100 flex flex-col py-4 transition-all duration-200 ${
            sidebarOpen ? "w-56" : "w-16"
          }`}
        >
          <div className={`flex ${sidebarOpen ? "justify-end px-3" : "justify-center"} mb-2`}>
            <button
              type="button"
              onClick={() => setSidebarOpen((o) => !o)}
              className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition"
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

        <main className="flex-1 overflow-auto px-4 py-6 min-w-0 bg-gradient-to-br from-emerald-50/70 via-sky-50/80 to-emerald-100/80">
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
                shelfLettersByBay={activeLocationProfile?.shelfLettersByBay}
              />
            )}
            {activeTab === TABS.LOCATOR && (
              <DocumentLocator
                boxes={boxes}
                addLog={addLog}
                shelfLettersByBay={activeLocationProfile?.shelfLettersByBay}
                rowLabels={activeLocationProfile?.rowLabels}
              />
            )}
            {activeTab === TABS.LOCATIONS && (
              <LocationManagement
                profiles={locationProfiles}
                activeProfileId={activeLocationProfileId}
                onSetActiveProfileId={setActiveLocationProfileId}
                onUpsertProfile={(profile) =>
                  setLocationProfiles((prev) => {
                    const idx = prev.findIndex((p) => p.id === profile.id);
                    if (idx >= 0) {
                      const next = [...prev];
                      next[idx] = profile;
                      return next;
                    }
                    return [profile, ...prev];
                  })
                }
                onDeleteProfile={(id) =>
                  setLocationProfiles((prev) => {
                    const next = prev.filter((p) => p.id !== id);
                    if (activeLocationProfileId === id && next.length) {
                      setActiveLocationProfileId(next[0].id);
                    }
                    return next;
                  })
                }
              />
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Recent events and activity across the archive system.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <div className="space-y-4">
          <div className="border-2 border-emerald-200/60 rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 p-5 md:p-6 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="bg-white border-2 border-emerald-200/50 rounded-2xl px-5 py-4 shadow-md hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Registered Boxes</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-sky-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">{boxes.length}</p>
              </div>
            </div>
          </div>
          <div className="border-2 border-emerald-200/60 rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 p-5 md:p-6 max-h-[28rem] overflow-y-auto custom-scrollbar shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
              Activity Log
            </h3>
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
                    className="bg-white border-2 border-emerald-200/50 rounded-2xl px-4 py-3 flex flex-col gap-2 shadow-sm hover:shadow-lg hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-300 group"
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
                        <p className="font-mono text-[11px] text-emerald-800 bg-gradient-to-r from-emerald-50 to-sky-50 border-2 border-emerald-200/50 rounded-lg px-3 py-1.5 mt-1 shadow-sm group-hover:shadow-md transition-all duration-300">
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
