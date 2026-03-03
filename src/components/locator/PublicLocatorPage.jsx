import React, { useState, useEffect, useCallback } from "react";
import DocumentLocator from "./DocumentLocator.jsx";
import ELogPage from "../elog/ELogPage.jsx";
import { Modal } from "../ui/index.js";
import { boxesAPI, locationProfilesAPI } from "../../api/index.js";
import { DEFAULT_SHELF_LETTERS_BY_BAY, DEFAULT_ROW_LABELS } from "../../constants/index.js";

const VIEWS = { LOCATOR: "locator", ELOG: "elog" };

export default function PublicLocatorPage({ onLogin, addLog }) {
  const [view, setView] = useState(VIEWS.LOCATOR);
  const [manualOpen, setManualOpen] = useState(false);
  const [elogManualOpen, setElogManualOpen] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [shelfLettersByBay, setShelfLettersByBay] = useState(DEFAULT_SHELF_LETTERS_BY_BAY);
  const [rowLabels, setRowLabels] = useState(DEFAULT_ROW_LABELS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [boxesData, activeProfile] = await Promise.all([
        boxesAPI.getAll(),
        locationProfilesAPI.getActive().catch(() => null),
      ]);
      setBoxes(boxesData);
      if (activeProfile?.shelfLettersByBay) setShelfLettersByBay(activeProfile.shelfLettersByBay);
      if (activeProfile?.rowLabels) setRowLabels(activeProfile.rowLabels);
    } catch (err) {
      console.error("Failed to load locator data:", err);
      setError("Unable to load document data. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (view === VIEWS.ELOG) {
      setManualOpen(false);
    } else {
      setElogManualOpen(false);
    }
  }, [view]);

  return (
    <div className="min-h-screen bg-white/50">
      {/* Header */}
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
                Public Search
              </p>
            </div>
          </div>
          <div className="flex-1 px-4 py-3 flex items-center justify-end gap-3 min-w-0">
            {view === VIEWS.ELOG ? (
              <>
                <button
                  type="button"
                  onClick={() => setView(VIEWS.LOCATOR)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:shadow-md border border-white/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Locator
                </button>
                <button
                  type="button"
                  onClick={() => setElogManualOpen(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:shadow-md border border-white/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  User Manual
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setView(VIEWS.ELOG)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:shadow-md border border-white/30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                E-Log
              </button>
            )}
            {view !== VIEWS.ELOG && (
              <button
                type="button"
                onClick={() => setManualOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:shadow-md border border-white/30"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                User Manual
              </button>
            )}
            <button
              type="button"
              onClick={onLogin}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/20 hover:bg-white/30 px-4 py-2 text-xs font-semibold text-white transition-all duration-200 hover:shadow-md border border-white/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Login
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="px-4 py-6 max-w-[min(80rem,calc(100vw-2rem))] mx-auto">
        <section className="w-full mx-auto bg-white rounded-3xl p-5 md:p-6 shadow-lg">
          {view === VIEWS.ELOG ? (
            <ELogPage addLog={addLog} />
          ) : loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading document locator...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
              <button
                type="button"
                onClick={loadData}
                className="text-sm font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Retry
              </button>
            </div>
          ) : (
            <DocumentLocator
              boxes={boxes}
              addLog={addLog}
              shelfLettersByBay={shelfLettersByBay}
              rowLabels={rowLabels}
            />
          )}
        </section>
      </main>

      {/* Public User Manual Modal */}
      <Modal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        title="Public User Manual"
        maxWidth="max-w-2xl"
        borderColor="border-emerald-100"
      >
        <div className="space-y-5 text-sm text-gray-700 max-h-[70vh] overflow-y-auto pr-1">
          <p className="leading-relaxed">
            The public Document Locator allows anyone to search for document locations without logging in. Use it to find where a physical certificate box is stored in the archive.
          </p>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">1. Accessing the Public Locator</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
              <li>Open the CCRO Archive Locator application or visit the public URL.</li>
              <li>You will see the <strong>Document Locator</strong> screen with the header &ldquo;CCRO Document Locator — Public Search.&rdquo;</li>
              <li>No login is required; you can search immediately.</li>
            </ol>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">2. How to Search for a Document</h4>
            <p className="mb-2 text-gray-600">Search uses four fields in this order: <strong>Type of Certificate</strong>, <strong>Year</strong>, <strong>Month</strong>, and <strong>Registry Number</strong>.</p>
            <ul className="space-y-2 text-gray-600">
              <li><strong>Type of Certificate:</strong> Choose Birth (COLB), Marriage (COM), or Death (COD).</li>
              <li><strong>Year:</strong> Choose from the list (options depend on registered boxes for the selected type).</li>
              <li><strong>Month:</strong> Choose the month (January, February, etc.).</li>
              <li><strong>Registry Number:</strong> Enter the registry number (numeric, up to 6 digits). A hint shows valid ranges.</li>
            </ul>
            <p className="mt-2 text-gray-600">Click <strong>Search</strong> to find the location. Use <strong>Clear</strong> to reset.</p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">3. Understanding the Search Result</h4>
            <p className="mb-2 text-gray-600">After a successful search you will see:</p>
            <ul className="space-y-1.5 text-gray-600">
              <li><strong>Bay</strong> — Bay number (e.g., Bay 1, Bay 2).</li>
              <li><strong>Shelf</strong> — Shelf label (e.g., S-A, S-B).</li>
              <li><strong>Row</strong> — Row/level label (e.g., R-6, R-5).</li>
              <li><strong>Box #</strong> — Box number.</li>
            </ul>
            <p className="mt-2 text-gray-600">
              Go to the Bay, find the Shelf and Row, then locate the Box #. A unique <strong>search code</strong> (e.g., <code className="bg-gray-100 px-1 rounded">COB-2024-B1-S-A-R6-Box#12</code>) is shown for reference.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">4. 2D Table and 3D Model Views</h4>
            <p className="text-gray-600 mb-2">
              The result includes two layout views: a <strong>2D Table</strong> (highlighted cell) and an interactive <strong>3D Model</strong>. In the 3D view: drag to rotate, scroll to zoom. Use <strong>Fullscreen</strong> for a larger view.
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">5. Error Messages</h4>
            <ul className="space-y-1.5 text-gray-600">
              <li>&ldquo;Please complete all search fields in order.&rdquo; — Fill Type, Year, Month, and Registry Number.</li>
              <li>&ldquo;Registry number must be numeric (up to 6 digits).&rdquo; — Use only digits.</li>
              <li>&ldquo;No matching registered box found&rdquo; — No box is registered for that combination. Ask an admin to add it.</li>
              <li>&ldquo;Registry number X does not fall within any registered box&apos;s range&rdquo; — Verify the registry number and try again.</li>
              <li>&ldquo;Unable to load document data&rdquo; — Use <strong>Retry</strong> or try again later.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">6. Login &amp; Retry</h4>
            <p className="text-gray-600">
              <strong>Login</strong> (top-right) takes you to the login screen if you have admin credentials. If you see &ldquo;Unable to load document data,&rdquo; click <strong>Retry</strong> to reload.
            </p>
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
        </div>
      </Modal>

      {/* E-Log User Manual Modal (E-Log only) */}
      <Modal
        open={elogManualOpen}
        onClose={() => setElogManualOpen(false)}
        title="E-Log User Manual"
        maxWidth="max-w-2xl"
        borderColor="border-emerald-100"
      >
        <div className="space-y-5 text-sm text-gray-700 max-h-[70vh] overflow-y-auto pr-1">
          <p className="leading-relaxed">
            For personnel authorized to check out and return certificate boxes or bundles from the CCRO archive. If you have a <strong>Personnel ID</strong> and permission to use the E-Log, this guide explains how to check out and return boxes. No admin login is required—only your Personnel ID.
          </p>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">1. Opening the E-Log</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
              <li>From the CCRO Document Locator screen, click <strong>E-Log</strong> in the header.</li>
              <li>The E-Log page opens with three sections: <strong>Step 1</strong>, <strong>Step 2</strong>, and <strong>Step 3</strong>.</li>
              <li>Scroll down to move through the steps.</li>
            </ol>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">2. Step 1: Select or Search Your Personnel ID</h4>
            <p className="mb-2 text-gray-600">You must identify yourself before you can check out a box.</p>
            <ul className="space-y-1.5 text-gray-600">
              <li><strong>Type your ID</strong> — Start typing. The dropdown filters to show matching personnel. When your ID is recognized, a green message appears with your name.</li>
              <li><strong>Select from list</strong> — Click the dropdown arrow (▼) to open the full list. Click your ID and name to select.</li>
              <li>When recognized: <strong>&ldquo;[Your Name] — You can check out a box below.&rdquo;</strong></li>
              <li>When not recognized: <em>&ldquo;ID not recognized. Only registered personnel can check out boxes.&rdquo;</em> Contact your administrator.</li>
              <li><strong>View check-out box</strong> — Click to see all boxes currently checked out, who has them, and when.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">3. Step 2: Choose a Box to Check Out</h4>
            <p className="mb-2 text-gray-600">After your ID is recognized, you can select a box to check out.</p>
            <ul className="space-y-1.5 text-gray-600">
              <li><strong>Box table</strong> — Lists all registered boxes with Type, Box #, Registry Range, Month, Year, Status, and Action.</li>
              <li><strong>Status</strong> — Shows <strong>Available</strong> (green) or <strong>Checked out</strong> (amber).</li>
              <li><strong>Search</strong> — Filter by box number, registry range, certificate type, month, or year. Click <strong>Search / Locate</strong> to scroll to the first match.</li>
              <li><strong>Check out</strong> — Find the box, click <strong>Check Out This Box</strong>, confirm in the dialog, then click <strong>Yes, Check Out This Box</strong>.</li>
              <li><strong>Rules</strong> — You may have only one box checked out at a time. Return it in Step 3 before checking out another.</li>
            </ul>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">4. Step 3: Return a Box</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-gray-600">
              <li>Enter your <strong>Personnel ID</strong> in the field.</li>
              <li>The system loads your checked-out boxes.</li>
              <li>If you have boxes checked out: A list appears with an <strong>I Returned This Box</strong> button for each.</li>
              <li>Click <strong>I Returned This Box</strong> for the box you are returning.</li>
              <li>Re-enter your Personnel ID in the confirmation field.</li>
              <li>Click <strong>Confirm Return</strong> only when the ID matches.</li>
            </ol>
            <p className="mt-2 text-gray-600">
              <strong>Important:</strong> You must re-enter your Personnel ID exactly (same spelling and case) to confirm. If they do not match, you will see: &ldquo;Personnel ID does not match. Enter your ID again to confirm.&rdquo;
            </p>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">5. E-Log Summary</h4>
            <table className="w-full text-left border border-gray-200 rounded-lg overflow-hidden text-gray-600">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 font-semibold">Step</th>
                  <th className="px-3 py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-200"><td className="px-3 py-2">Step 1</td><td className="px-3 py-2">Type or select your Personnel ID. Use View check-out box to see who has boxes.</td></tr>
                <tr className="border-t border-gray-200"><td className="px-3 py-2">Step 2</td><td className="px-3 py-2">Search or scroll the box table. Click Check Out This Box and confirm.</td></tr>
                <tr className="border-t border-gray-200"><td className="px-3 py-2">Step 3</td><td className="px-3 py-2">Enter your ID, see your checked-out box, click I Returned This Box, re-enter your ID to confirm.</td></tr>
              </tbody>
            </table>
          </section>

          <section>
            <h4 className="font-semibold text-gray-900 mb-2">6. Leaving the E-Log</h4>
            <p className="text-gray-600">Use <strong>Back to Locator</strong> in the header to return to the Document Locator.</p>
          </section>
        </div>
      </Modal>
    </div>
  );
}
