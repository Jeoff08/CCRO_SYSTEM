import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import DocumentLocator from "../locator/DocumentLocator.jsx";
import BoxManagement from "../boxes/BoxManagement.jsx";
import PersonnelManagement from "../personnel/PersonnelManagement.jsx";
import LocationManagement from "../locations/LocationManagement.jsx";
import Backup from "../backup/Backup.jsx";
import AboutDeveloper from "../about/AboutDeveloper.jsx";
import DashboardHome from "./DashboardHome.jsx";
import Sidebar, { TABS } from "../layout/Sidebar.jsx";
import { Modal } from "../ui/index.js";
import { useBoxes, useLocationProfiles } from "../../hooks/index.js";
import { checkoutsAPI } from "../../api/index.js";

export default function Dashboard({
  user,
  onLogout,
  activityLog,
  addLog,
  clearHistory,
}) {
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [loading, setLoading] = useState(true);
  const [adminManualOpen, setAdminManualOpen] = useState(false);
  const [activeCheckouts, setActiveCheckouts] = useState([]);

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
      try {
        const [, , checkoutsData] = await Promise.all([
          loadBoxes(),
          loadProfiles(),
          checkoutsAPI.getAll(true),
        ]);
        setActiveCheckouts(checkoutsData || []);
      } catch (error) {
        console.error("Failed to load checkouts:", error);
      } finally {
        setLoading(false);
      }
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

  const checkedOutBoxIds = useMemo(
    () => new Set(activeCheckouts.map((c) => c.boxId)),
    [activeCheckouts]
  );

  const checkoutByBoxId = useMemo(
    () => new Map(activeCheckouts.map((c) => [c.boxId, { personnelId: c.personnelId, personnelName: c.personnelName }])),
    [activeCheckouts]
  );

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
            <button
              type="button"
              onClick={() => setAdminManualOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:shadow-md border border-white/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              User Manual
            </button>
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
                checkedOutBoxIds={checkedOutBoxIds}
                checkoutByBoxId={checkoutByBoxId}
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
            {activeTab === TABS.PERSONNEL && (
              <PersonnelManagement />
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
            {activeTab === TABS.BACKUP && !loading && (
              <Backup
                boxes={boxes}
                onRefresh={loadBoxes}
              />
            )}
            {activeTab === TABS.ABOUT && (
              <AboutDeveloper />
            )}
          </section>
        </main>
      </div>

      {/* Admin User Manual modal */}
      <Modal
        open={adminManualOpen}
        onClose={() => setAdminManualOpen(false)}
        title="Admin User Manual"
        maxWidth="max-w-2xl"
        borderColor="border-emerald-100"
      >
        <div className="space-y-5 text-sm text-gray-700 max-h-[70vh] overflow-y-auto pr-1">
          <p className="leading-relaxed">
            Administrators manage boxes, locations, and monitor activity. You must log in to access the admin area.
          </p>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">1. Logging In</h4>
            <p className="text-gray-600 mb-2">On the public locator page, click <strong>Login</strong> (top-right). Enter <strong>Username</strong> and <strong>Password</strong>, then click Login. If credentials are valid, you are taken to the Dashboard. Click &ldquo;← Back to Document Locator&rdquo; on the login page to return without logging in.</p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">2. Admin Layout</h4>
            <p className="text-gray-600 mb-2">After login: <strong>Header</strong> — Logo and your username and role. <strong>Sidebar</strong> — Dashboard, Box Management, Document Locator, Location Management. <strong>Main area</strong> — Content for the selected item. <strong>Logout</strong> — At the bottom of the sidebar.</p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">3. Dashboard</h4>
            <p className="text-gray-600 mb-2">Overview of recent activity and stats. <strong>Quick Stats</strong> — Registered Boxes count. <strong>Activity Log</strong> — Recent actions (logins, searches, box add/update/delete). Use <strong>Clear History</strong> to remove all activity entries.</p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">4. Box Management</h4>
            <p className="text-gray-600 mb-2">Register and maintain boxes. <strong>Add box</strong> — Complete Certificate Type, Year, Month, Box Number, Bay, Shelf, Row, Registry Range. <strong>Edit</strong> — Click Update, change fields, Save. <strong>View</strong> — Click View for details. <strong>Delete</strong> — Click Delete and confirm. Filter by Certificate Type and Search across fields. Use pagination for many boxes.</p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">5. Location Management</h4>
            <p className="text-gray-600 mb-2">Configure bays, shelves, and rows. <strong>Add Bay</strong> — Enter bay number. <strong>Add Shelf</strong> — Select bay, enter shelf letters (e.g. S-A, S-B). <strong>Add Rows</strong> — Select bay and shelf, enter row labels. Edit in place in the 2D Table. Use Delete to remove bays, shelves, or rows. Click <strong>Save Changes</strong> and confirm to update the active profile. 2D Table for editing; 3D Model for viewing (drag to rotate, scroll to zoom).</p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">6. Backup (Export / Import)</h4>
            <p className="text-gray-600 mb-2">Export Box management as a .db file or import from a .db file. Only the registered boxes table is included; use a file exported with &ldquo;Export .db (Box management)&rdquo; for import.</p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">7. Unsaved Changes &amp; Logout</h4>
            <p className="text-gray-600 mb-2">If you switch away from Location Management or log out with unsaved changes, a confirmation appears: <strong>Stay &amp; keep editing</strong>, <strong>Discard changes</strong>, or <strong>Save &amp; continue</strong>. Click Logout at the bottom of the sidebar to return to the public Document Locator page.</p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">Certificate Types</h4>
            <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden text-gray-600">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 font-semibold">Code</th>
                  <th className="px-3 py-2 font-semibold">Full Name</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200"><td className="px-3 py-2">COLB</td><td className="px-3 py-2">Birth (COLB)</td></tr>
                <tr className="border-t border-gray-200"><td className="px-3 py-2">COM</td><td className="px-3 py-2">Marriage (COM)</td></tr>
                <tr className="border-t border-gray-200"><td className="px-3 py-2">COD</td><td className="px-3 py-2">Death (COD)</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">Registry Range Format</h4>
            <p className="text-gray-600">Use <code className="bg-gray-100 px-1 rounded">start-end</code> (e.g. <code className="bg-gray-100 px-1 rounded">1-500</code>, <code className="bg-gray-100 px-1 rounded">501-1000</code>). The registry number entered in a search must fall within one of the ranges.</p>
          </section>
        </div>
      </Modal>

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
