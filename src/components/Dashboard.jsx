import React, { useState, useEffect } from "react";
import DocumentLocator from "./DocumentLocator.jsx";
import BoxManagement from "./BoxManagement.jsx";
import LocationManagement, { DEFAULT_ROW_LABELS, DEFAULT_SHELF_LETTERS_BY_BAY } from "./LocationManagement.jsx";
import Sidebar, { TABS } from "./Sidebar.jsx";
import { boxesAPI, locationProfilesAPI } from "../api.js";

export default function Dashboard({ user, onLogout, activityLog, addLog, clearHistory }) {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [boxes, setBoxes] = useState([]);
  const [locationProfiles, setLocationProfiles] = useState([]);
  const [activeLocationProfileId, setActiveLocationProfileId] = useState("");
  const [loading, setLoading] = useState(true);

  // Load boxes and location profiles on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [boxesData, profilesData] = await Promise.all([
        boxesAPI.getAll(),
        locationProfilesAPI.getAll(),
      ]);

      setBoxes(boxesData);
      setLocationProfiles(profilesData.length > 0 ? profilesData : [
        {
          id: crypto.randomUUID(),
          name: "Default mapping",
          shelfLettersByBay: DEFAULT_SHELF_LETTERS_BY_BAY,
          rowLabels: DEFAULT_ROW_LABELS,
          updatedAt: new Date().toISOString(),
        },
      ]);

      // Set active profile
      const activeProfile = profilesData.find((p) => p.isActive) || profilesData[0];
      if (activeProfile) {
        setActiveLocationProfileId(activeProfile.id);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const activeLocationProfile =
    locationProfiles.find((p) => p.id === activeLocationProfileId) || locationProfiles[0];

  useEffect(() => {
    if (!activeLocationProfileId && locationProfiles.length) {
      setActiveLocationProfileId(locationProfiles[0].id);
    }
  }, [activeLocationProfileId, locationProfiles]);

  const handleAddBox = async (box) => {
    try {
      const newBox = await boxesAPI.create(box);
      setBoxes((prev) => [...prev, newBox]);
    } catch (error) {
      console.error("Failed to create box:", error);
      throw error;
    }
  };

  const handleUpdateBox = async (updated) => {
    try {
      const updatedBox = await boxesAPI.update(updated.id, updated);
      setBoxes((prev) => prev.map((b) => (b.id === updated.id ? updatedBox : b)));
    } catch (error) {
      console.error("Failed to update box:", error);
      throw error;
    }
  };

  const handleDeleteBox = async (id) => {
    try {
      await boxesAPI.delete(id);
      setBoxes((prev) => prev.filter((b) => b.id !== id));
    } catch (error) {
      console.error("Failed to delete box:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-white/50">
      <header className=" shadow-sm bg-emerald-700">
        <div className="flex items-center w-full">
          <div className="shrink-0 flex items-center px-3 py-3 gap-2 w-60">
            <img
              src="./logo-shortcut.png"
              alt="CCRO"
              className="rounded-full object-cover shrink-0 border-2 border-emerald-300 h-12 w-12"
            />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-100 leading-tight">
                CCRO Document Locator
              </p>
              <p className="text-xs font-[600] text-white text-center mt-2 leading-tight">
                Archiving
              </p>
            </div>
          </div>

          <div className="flex-1 px-4 py-3 flex items-center justify-end gap-3 min-w-0">
            {user && (
              <div className="text-right">
                <p className="text-xs font-semibold text-white">
                  {user.username}
                </p>
                <p className="text-[11px] text-emerald-200">{user.role}</p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-57px)]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

        <main className="flex-1 overflow-auto px-4 py-6 min-w-0 bg-white/50">
          <section
            className="w-full mx-auto bg-white rounded-3xl p-5 md:p-6"
            style={{ maxWidth: "min(80rem, calc(100vw - 18rem))" }}
          >
            {activeTab === TABS.DASHBOARD && !loading && (
              <DashboardHome activityLog={activityLog} boxes={boxes} clearHistory={clearHistory} />
            )}
            {activeTab === TABS.BOXES && (
              <BoxManagement
                boxes={boxes}
                onAdd={handleAddBox}
                onUpdate={handleUpdateBox}
                onDelete={handleDeleteBox}
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
            {activeTab === TABS.LOCATIONS && !loading && (
              <LocationManagement
                profiles={locationProfiles}
                activeProfileId={activeLocationProfileId}
                onSetActiveProfileId={async (id) => {
                  try {
                    await locationProfilesAPI.setActive(id);
                    setActiveLocationProfileId(id);
                    await loadData(); // Reload to get updated profiles
                  } catch (error) {
                    console.error("Failed to set active profile:", error);
                  }
                }}
                onUpsertProfile={async (profile) => {
                  try {
                    const savedProfile = await locationProfilesAPI.createOrUpdate(profile);
                    await loadData(); // Reload to get updated profiles
                  } catch (error) {
                    console.error("Failed to save profile:", error);
                    throw error;
                  }
                }}
                onDeleteProfile={async (id) => {
                  try {
                    await locationProfilesAPI.delete(id);
                    const next = locationProfiles.filter((p) => p.id !== id);
                    if (activeLocationProfileId === id && next.length) {
                      setActiveLocationProfileId(next[0].id);
                    }
                    await loadData(); // Reload to get updated profiles
                  } catch (error) {
                    console.error("Failed to delete profile:", error);
                    throw error;
                  }
                }}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function DashboardHome({ activityLog, boxes, clearHistory }) {
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
          <div className=" rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 p-5 md:p-6 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-2xl px-5 py-4 shadow-md hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Registered Boxes</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-sky-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">{boxes.length}</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 p-5 md:p-6 max-h-[28rem] overflow-y-auto custom-scrollbar shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
                Activity Log
              </h3>
              {activityLog.length > 0 && clearHistory && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white shadow-md rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                  title="Clear all activity logs"
                >
                  Clear History
                </button>
              )}
            </div>
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
                    className="bg-white rounded-2xl px-4 py-3 flex flex-col gap-2 shadow-sm hover:shadow-lg hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-300 group"
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
                        : entry.details?.message ?? entry.details ?? ""}
                    </p>
                      {(entry.searchCode || (typeof entry.details === "object" && entry.details?.searchCode)) && (
                        <p className="font-mono text-[11px] text-emerald-800 bg-gradient-to-r from-emerald-50 to-sky-50 border-2 border-emerald-200/50 rounded-lg px-3 py-1.5 mt-1 shadow-sm group-hover:shadow-md transition-all duration-300">
                          {entry.searchCode || entry.details?.searchCode}
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
    case "box-delete":
      return "Box Deleted";
    default:
      return type;
  }
}

function formatActivityTimestamp(iso) {
  // SQLite datetime('now') stores UTC without a Z suffix,
  // so append Z if missing so JS knows it's UTC before converting to PH time.
  const raw = typeof iso === "string" && !iso.endsWith("Z") && !iso.includes("+") ? iso + "Z" : iso;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
