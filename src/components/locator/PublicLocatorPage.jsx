import React, { useState, useEffect, useCallback } from "react";
import DocumentLocator from "./DocumentLocator.jsx";
import { boxesAPI, locationProfilesAPI } from "../../api/index.js";
import { DEFAULT_SHELF_LETTERS_BY_BAY, DEFAULT_ROW_LABELS } from "../../constants/index.js";

export default function PublicLocatorPage({ onLogin }) {
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
          {loading ? (
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
              addLog={null}
              shelfLettersByBay={shelfLettersByBay}
              rowLabels={rowLabels}
            />
          )}
        </section>
      </main>
    </div>
  );
}
