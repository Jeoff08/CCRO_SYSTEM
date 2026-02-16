import React, { useState, useEffect, useRef, useCallback } from "react";
import DocumentLocator from "../locator/DocumentLocator.jsx";
import BoxManagement from "../boxes/BoxManagement.jsx";
import LocationManagement from "../locations/LocationManagement.jsx";
import DashboardHome from "./DashboardHome.jsx";
import Sidebar, { TABS } from "../layout/Sidebar.jsx";
import { Modal } from "../ui/index.js";
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

  /* ── Unsaved-changes guard for Location Management ── */
  const [locationDirty, setLocationDirty] = useState(false);
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { type: "tab", tab } | { type: "logout" }
  const locationSaveRef = useRef(null);

  const handleDirtyChange = useCallback((isDirty) => setLocationDirty(isDirty), []);

  const guardedSetActiveTab = useCallback(
    (tab) => {
      if (activeTab === TABS.LOCATIONS && locationDirty && tab !== TABS.LOCATIONS) {
        setPendingAction({ type: "tab", tab });
        setUnsavedModalOpen(true);
      } else {
        setActiveTab(tab);
      }
    },
    [activeTab, locationDirty]
  );

  const guardedLogout = useCallback(() => {
    if (activeTab === TABS.LOCATIONS && locationDirty) {
      setPendingAction({ type: "logout" });
      setUnsavedModalOpen(true);
    } else {
      onLogout();
    }
  }, [activeTab, locationDirty, onLogout]);

  const executePendingAction = useCallback(() => {
    if (!pendingAction) return;
    if (pendingAction.type === "tab") setActiveTab(pendingAction.tab);
    else if (pendingAction.type === "logout") onLogout();
    setPendingAction(null);
    setUnsavedModalOpen(false);
  }, [pendingAction, onLogout]);

  const handleUnsavedSave = useCallback(() => {
    if (locationSaveRef.current) {
      const ok = locationSaveRef.current();
      if (ok === false) return; // validation failed – stay on page
    }
    executePendingAction();
  }, [executePendingAction]);

  const handleUnsavedDiscard = useCallback(() => {
    executePendingAction();
  }, [executePendingAction]);

  const handleUnsavedCancel = useCallback(() => {
    setPendingAction(null);
    setUnsavedModalOpen(false);
  }, []);

  return (
    <div className="h-screen overflow-hidden bg-white/50">
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

      <div className="flex h-[calc(100vh-57px)] overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={guardedSetActiveTab} onLogout={guardedLogout} />

        <main className="flex-1 overflow-y-auto px-4 py-6 min-w-0 bg-white/50">
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
                rowLabels={activeLocationProfile?.rowLabels}
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
                onDirtyChange={handleDirtyChange}
                saveRef={locationSaveRef}
              />
            )}
          </section>
        </main>
      </div>

      {/* Unsaved-changes modal */}
      <Modal open={unsavedModalOpen} onClose={handleUnsavedCancel} title="Unsaved changes" borderColor="border-amber-200">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            You have unsaved changes in <span className="font-semibold">Location Management</span>. What would you like to do?
          </p>
        </div>
        <div className="mt-5 flex flex-col sm:flex-row gap-2 justify-center">
          <button
            type="button"
            onClick={handleUnsavedCancel}
            className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
          >
            Stay &amp; keep editing
          </button>
          <button
            type="button"
            onClick={handleUnsavedDiscard}
            className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-5 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-50 transition-all duration-200"
          >
            Discard changes
          </button>
          <button
            type="button"
            onClick={handleUnsavedSave}
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 px-5 py-2.5 text-xs font-bold text-white hover:from-emerald-700 hover:to-sky-700 shadow-md shadow-emerald-500/30 transition-all duration-200"
          >
            Save &amp; continue
          </button>
        </div>
      </Modal>
    </div>
  );
}
