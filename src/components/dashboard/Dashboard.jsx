import React, { useState, useEffect } from "react";
import DocumentLocator from "../locator/DocumentLocator.jsx";
import BoxManagement from "../boxes/BoxManagement.jsx";
import LocationManagement from "../locations/LocationManagement.jsx";
import DashboardHome from "./DashboardHome.jsx";
import Sidebar, { TABS } from "../layout/Sidebar.jsx";
import { useBoxes, useLocationProfiles } from "../../hooks/index.js";

export default function Dashboard({
  user,
  onLogout,
  activityLog,
  addLog,
  clearHistory,
}) {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [loading, setLoading] = useState(true);

  const { boxes, loadBoxes, addBox, updateBox, deleteBox } = useBoxes();
  const {
    locationProfiles,
    activeLocationProfileId,
    activeLocationProfile,
    setActiveLocationProfileId,
    loadProfiles,
    setActiveProfile,
    upsertProfile,
    deleteProfile,
  } = useLocationProfiles();

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadBoxes(), loadProfiles()]);
      setLoading(false);
    })();
  }, [loadBoxes, loadProfiles]);

  // Ensure an active profile ID is always set
  useEffect(() => {
    if (!activeLocationProfileId && locationProfiles.length) {
      setActiveLocationProfileId(locationProfiles[0].id);
    }
  }, [activeLocationProfileId, locationProfiles, setActiveLocationProfileId]);

  return (
    <div className="min-h-screen bg-white/50">
      {/* Top header bar */}
      <header className="shadow-sm bg-emerald-700">
        <div className="flex items-center w-full">
          <div className="shrink-0 flex items-center px-3 py-3 gap-2 w-60">
            <img
              src="./logo-rm.png"
              alt="CCRO"
              className="rounded-full object-cover shrink-0 h-12 w-12"
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
                <p className="text-xs font-semibold text-white">{user.username}</p>
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
                onAdd={addBox}
                onUpdate={updateBox}
                onDelete={deleteBox}
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
                onSetActiveProfileId={setActiveProfile}
                onUpsertProfile={upsertProfile}
                onDeleteProfile={deleteProfile}
              />
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
