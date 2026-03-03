import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal, Toast } from "../ui/index.js";
import { boxesAPI, personnelAPI, checkoutsAPI } from "../../api/index.js";
import CertificateBadge from "../shared/CertificateBadge.jsx";
import { MONTHS } from "../../constants/index.js";

export default function ELogPage({ addLog }) {
  const [boxes, setBoxes] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [activeCheckouts, setActiveCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  // Step 1: personnel ID
  const [personnelInput, setPersonnelInput] = useState("");
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [personnelDropdownOpen, setPersonnelDropdownOpen] = useState(false);
  const personnelInputRef = useRef(null);
  const boxTableRef = useRef(null);

  // Step 3: return flow
  const [returnPersonnelId, setReturnPersonnelId] = useState("");
  const [returnPersonnelCheckouts, setReturnPersonnelCheckouts] = useState([]);

  // Search for boxes table
  const [boxSearch, setBoxSearch] = useState("");

  // Modals
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [pendingCheckoutBox, setPendingCheckoutBox] = useState(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [pendingReturnCheckout, setPendingReturnCheckout] = useState(null);
  const [returnConfirmId, setReturnConfirmId] = useState("");
  const [viewCheckoutsModalOpen, setViewCheckoutsModalOpen] = useState(false);

  // Actions
  const [checkingOut, setCheckingOut] = useState(false);
  const [returning, setReturning] = useState(false);
  const [loadingReturnList, setLoadingReturnList] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [boxesData, personnelData, checkoutsData] = await Promise.all([
        boxesAPI.getAll(),
        personnelAPI.getAll(),
        checkoutsAPI.getAll(true),
      ]);
      setBoxes(boxesData || []);
      setPersonnel(personnelData || []);
      setActiveCheckouts(checkoutsData || []);
    } catch (err) {
      setError(err?.message || "Unable to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Resolve selected personnel from input
  useEffect(() => {
    if (!personnelInput.trim()) {
      setSelectedPersonnel(null);
      return;
    }
    const pid = personnelInput.trim();
    const found = personnel.find(
      (p) => p.personnelId?.toLowerCase() === pid.toLowerCase()
    );
    setSelectedPersonnel(found || null);
  }, [personnelInput, personnel]);

  const boxIdsCheckedOut = new Set(activeCheckouts.map((c) => c.boxId));
  const getBoxDisplay = (boxId) => {
    const box = boxes.find((b) => b.id === boxId);
    return box ? `Box #${box.boxNumber ?? boxId}` : boxId;
  };

  const filteredBoxes = useCallback(() => {
    if (!boxSearch.trim()) return boxes;
    const q = boxSearch.toLowerCase().trim();
    return boxes.filter((b) => {
      const boxNum = String(b.boxNumber ?? "").toLowerCase();
      const regRange = String(b.registryRange ?? "").toLowerCase();
      const cert = String(b.certificateType ?? "").toLowerCase();
      const month = String(MONTHS[b.monthIndex] ?? "").toLowerCase();
      const year = String(b.year ?? "").toLowerCase();
      return (
        boxNum.includes(q) ||
        regRange.includes(q) ||
        cert.includes(q) ||
        month.includes(q) ||
        year.includes(q)
      );
    });
  }, [boxes, boxSearch]);

  const filteredPersonnelList = personnel.filter((p) => {
    const term = personnelInput.trim().toLowerCase();
    if (!term) return true;
    const pid = String(p.personnelId ?? "").toLowerCase();
    const name = String(p.fullName ?? "").toLowerCase();
    return pid.includes(term) || name.includes(term);
  });

  const handleSelectPersonnel = (p) => {
    setPersonnelInput(p.personnelId || "");
    setSelectedPersonnel(p);
    setPersonnelDropdownOpen(false);
    personnelInputRef.current?.focus();
  };

  const canCheckout =
    selectedPersonnel &&
    !activeCheckouts.some((c) => c.personnelId === selectedPersonnel.personnelId);

  const handleCheckoutClick = (box) => {
    if (!canCheckout) return;
    if (boxIdsCheckedOut.has(box.id)) return;
    setPendingCheckoutBox(box);
    setCheckoutModalOpen(true);
  };

  const handleConfirmCheckout = async () => {
    if (!pendingCheckoutBox || !selectedPersonnel) return;
    setCheckingOut(true);
    setError("");
    setSuccessMessage(null);
    try {
      const now = new Date();
      const checkoutDate = now.toISOString().slice(0, 10);
      const checkoutTime = now.toTimeString().slice(0, 8);
      await checkoutsAPI.create({
        personnelId: selectedPersonnel.personnelId,
        personnelName: selectedPersonnel.fullName,
        boxId: pendingCheckoutBox.id,
        certType: pendingCheckoutBox.certificateType,
        registryRange: pendingCheckoutBox.registryRange || null,
        monthStr: MONTHS[pendingCheckoutBox.monthIndex] || null,
        yearStr: String(pendingCheckoutBox.year ?? ""),
        checkoutDate,
        checkoutTime,
      });
      await loadData();
      setCheckoutModalOpen(false);
      setPendingCheckoutBox(null);
      setSuccessMessage(
        `Box #${pendingCheckoutBox.boxNumber ?? pendingCheckoutBox.id} checked out by ${selectedPersonnel.fullName}.`
      );
      if (addLog) addLog("checkout", `Box ${pendingCheckoutBox.boxNumber ?? pendingCheckoutBox.id} checked out by ${selectedPersonnel.fullName} (${selectedPersonnel.personnelId})`);
    } catch (err) {
      setError(err?.message || "Checkout failed.");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleReturnPersonnelIdChange = async (id) => {
    const upper = id.toUpperCase();
    setReturnPersonnelId(upper);
    const trimmed = upper.trim();
    if (!trimmed) {
      setReturnPersonnelCheckouts([]);
      return;
    }
    setLoadingReturnList(true);
    try {
      const list = await checkoutsAPI.getByPersonnelId(trimmed);
      setReturnPersonnelCheckouts(list || []);
    } catch {
      setReturnPersonnelCheckouts([]);
    } finally {
      setLoadingReturnList(false);
    }
  };

  const handleReturnClick = (checkout) => {
    setPendingReturnCheckout(checkout);
    setReturnConfirmId("");
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!pendingReturnCheckout) return;
    if (returnConfirmId.trim() !== returnPersonnelId.trim()) {
      setError("Personnel ID does not match. Enter your ID again to confirm.");
      return;
    }
    setReturning(true);
    setError("");
    setSuccessMessage(null);
    try {
      await checkoutsAPI.markReturned(pendingReturnCheckout.id);
      await loadData();
      setReturnModalOpen(false);
      setPendingReturnCheckout(null);
      setReturnConfirmId("");
      setReturnPersonnelId("");
      setReturnPersonnelCheckouts([]);
      setSuccessMessage(
        `Box returned by ${pendingReturnCheckout.personnelName || returnPersonnelId}.`
      );
      if (addLog) addLog("return", `Box returned by ${pendingReturnCheckout.personnelName || returnPersonnelId}`);
    } catch (err) {
      setError(err?.message || "Return failed.");
    } finally {
      setReturning(false);
    }
  };

  const scrollToFirstMatch = () => {
    const rows = boxTableRef.current?.querySelectorAll("tbody tr");
    if (!rows?.length) return;
    const first = rows[0];
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const displayBoxes = filteredBoxes();

  return (
    <div className="space-y-6">
      <Toast
        variant="success"
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
      <Toast
        variant="error"
        message={error}
        onClose={() => setError("")}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading E-Log data...</p>
        </div>
      ) : (
        <>
          {/* Step 1: Personnel ID */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h2 className="text-lg font-bold text-gray-900">Step 1: Select or Search Your Personnel ID</h2>
              <button
                type="button"
                onClick={() => setViewCheckoutsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-4 py-2 text-sm font-bold text-emerald-700 hover:bg-emerald-50 transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View check-out box
              </button>
            </div>
            <div className="relative max-w-md">
              <input
                ref={personnelInputRef}
                type="text"
                value={personnelInput}
                onChange={(e) => setPersonnelInput(e.target.value.toUpperCase())}
                onFocus={() => setPersonnelDropdownOpen(true)}
                placeholder="Type your ID or select from list"
                className="w-full rounded-xl border-2 border-slate-200 pl-4 pr-12 py-2.5 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              />
              <button
                type="button"
                onClick={() => setPersonnelDropdownOpen((o) => !o)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Open personnel list"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {personnelDropdownOpen && (
                <div className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border-2 border-slate-200 bg-white shadow-lg">
                  {filteredPersonnelList.length === 0 ? (
                    <p className="px-4 py-3 text-sm text-gray-500">No personnel found.</p>
                  ) : (
                    filteredPersonnelList.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectPersonnel(p)}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-emerald-50 border-b border-slate-100 last:border-0"
                      >
                        <span className="font-semibold text-gray-900">{p.personnelId}</span>
                        <span className="text-gray-600 ml-2">— {p.fullName}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedPersonnel && (
              <div className="mt-3 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
                <strong>{selectedPersonnel.fullName}</strong> — You can check out a box below.
              </div>
            )}
            {personnelInput.trim() && !selectedPersonnel && (
              <p className="mt-2 text-sm text-amber-700">ID not recognized. Only registered personnel can check out boxes.</p>
            )}
          </div>

          {/* Step 2: Choose box to check out */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" ref={boxTableRef}>
            <h2 className="text-lg font-bold text-gray-900 mb-3">Step 2: Choose a Box to Check Out</h2>
            <div className="flex flex-wrap gap-3 mb-3">
              <input
                type="text"
                value={boxSearch}
                onChange={(e) => setBoxSearch(e.target.value)}
                placeholder="Search by box #, registry range, type, month, year"
                className="flex-1 min-w-[200px] rounded-xl border-2 border-slate-200 pl-4 py-2 text-sm focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={scrollToFirstMatch}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"
              >
                Search / Locate
              </button>
            </div>
            {displayBoxes.length > 0 && (
              <p className="text-sm text-gray-600 mb-2">
                Showing {displayBoxes.length} of {boxes.length} box{boxes.length !== 1 ? "es" : ""} {boxSearch ? "matching your search" : ""}.
              </p>
            )}
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/40">
              <div className="max-h-80 overflow-y-auto overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Type of Certificate</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Box #</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Registry Range</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Month</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Year</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayBoxes.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No boxes registered. {boxSearch ? "Try a different search." : "Ask an admin to add boxes."}
                        </td>
                      </tr>
                    ) : (
                      displayBoxes.map((box) => {
                        const isCheckedOut = boxIdsCheckedOut.has(box.id);
                        const canClick = canCheckout && !isCheckedOut;
                        return (
                          <tr key={box.id} className="border-t border-slate-200 hover:bg-slate-50">
                            <td className="px-3 py-2">
                              {box.certificateType && <CertificateBadge type={box.certificateType} compact />}
                            </td>
                            <td className="px-3 py-2 font-medium">{box.boxNumber ?? "—"}</td>
                            <td className="px-3 py-2 text-gray-600">{box.registryRange || "—"}</td>
                            <td className="px-3 py-2">{MONTHS[box.monthIndex] ?? "—"}</td>
                            <td className="px-3 py-2">{box.year ?? "—"}</td>
                            <td className="px-3 py-2">
                              {isCheckedOut ? (
                                <span className="text-amber-700 font-semibold">Checked out</span>
                              ) : (
                                <span className="text-emerald-600">Available</span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => handleCheckoutClick(box)}
                                disabled={!canClick}
                                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Check Out This Box
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Step 3: Return a box */}
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/60 p-5 shadow-md shadow-emerald-100/70">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-[11px] font-bold text-white shadow-sm shadow-emerald-500/60">
                    3
                  </span>
                  Return a Box
                </h2>
                <p className="text-xs text-emerald-800/90 mt-1">
                  Enter your Personnel ID, review your active check-outs, then confirm which box you are returning.
                </p>
              </div>
              {returnPersonnelCheckouts.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-emerald-900 bg-emerald-100/80 border border-emerald-200 rounded-full px-3 py-1 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    {returnPersonnelCheckouts.length} box
                    {returnPersonnelCheckouts.length > 1 ? "es are" : " is"} currently checked out under this ID.
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-5">
              <div className="w-full md:w-72 space-y-3">
                <div className="max-w-md">
                  <label className="block text-sm font-semibold text-emerald-900 mb-1">
                    Your Personnel ID
                  </label>
                  <input
                    type="text"
                    value={returnPersonnelId}
                    onChange={(e) => handleReturnPersonnelIdChange(e.target.value)}
                    placeholder="Type your ID to see your boxes"
                    className="w-full rounded-xl border-2 border-emerald-200 bg-white/90 pl-4 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/80 shadow-sm"
                  />
                  <p className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    We’ll only show boxes that are still checked out under this ID.
                  </p>
                </div>

                <div className="hidden md:flex flex-col gap-2 text-[11px] text-emerald-900 bg-emerald-50/80 border border-emerald-100 rounded-2xl px-3 py-3 shadow-sm">
                  <div className="flex items-center gap-2 font-semibold uppercase tracking-[0.15em] text-emerald-700 text-[10px]">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Quick steps
                  </div>
                  <ol className="space-y-1.5 list-decimal list-inside">
                    <li>Type your Personnel ID.</li>
                    <li>Choose the box you are returning.</li>
                    <li>Confirm your ID and submit.</li>
                  </ol>
                </div>
              </div>

              <div className="flex-1 min-w-0 space-y-3">
                {loadingReturnList && (
                  <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-2xl px-3 py-2">
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span>Loading your checked-out boxes...</span>
                  </div>
                )}

                {!loadingReturnList && returnPersonnelId.trim() && returnPersonnelCheckouts.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-emerald-200 bg-white/70 px-4 py-3 text-sm text-emerald-900 flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>No boxes are currently checked out under this ID.</span>
                  </div>
                )}

                {!loadingReturnList && returnPersonnelCheckouts.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-emerald-900 flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-[10px] text-white">
                        ✓
                      </span>
                      Your checked-out boxes
                    </p>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {returnPersonnelCheckouts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleReturnClick(c)}
                          className="w-full text-left group rounded-2xl border border-emerald-100 bg-white/90 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-emerald-100/60 px-4 py-3 text-sm shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-2 text-emerald-900 font-medium">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 group-hover:scale-110 transition-transform" />
                              <CertificateBadge type={c.certType} compact />
                              <span className="font-semibold">{getBoxDisplay(c.boxId)}</span>
                            </span>
                            <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                              {c.checkoutDate} • {c.checkoutTime}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-800">
                            <span className="inline-flex items-center gap-1 bg-emerald-50/80 rounded-full px-2 py-0.5 border border-emerald-100">
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                                Registry
                              </span>
                              <span>{c.registryRange || "—"}</span>
                            </span>
                            <span className="text-emerald-900/80">
                              {c.monthStr} {c.yearStr}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-emerald-900/80">
                            <span>
                              Checked out by <strong>{c.personnelName}</strong> ({c.personnelId})
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 group-hover:text-emerald-800">
                              <span className="font-semibold">Tap to return</span>
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Checkout confirmation modal */}
      <Modal
        open={checkoutModalOpen}
        onClose={() => { setCheckoutModalOpen(false); setPendingCheckoutBox(null); }}
        title="Confirm Check Out"
        maxWidth="max-w-md"
        borderColor="border-emerald-200"
      >
        {pendingCheckoutBox && selectedPersonnel && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">
              <strong>{selectedPersonnel.fullName}</strong> ({selectedPersonnel.personnelId}) will check out:
            </p>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p><strong>Box #:</strong> {pendingCheckoutBox.boxNumber ?? pendingCheckoutBox.id}</p>
              <p><strong>Type:</strong> {pendingCheckoutBox.certificateType}</p>
              <p><strong>Registry Range:</strong> {pendingCheckoutBox.registryRange || "—"}</p>
              <p><strong>Month/Year:</strong> {MONTHS[pendingCheckoutBox.monthIndex]} {pendingCheckoutBox.year}</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setCheckoutModalOpen(false); setPendingCheckoutBox(null); }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                disabled={checkingOut}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {checkingOut ? "Checking out…" : "Yes, Check Out This Box"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Return confirmation modal */}
      <Modal
        open={returnModalOpen}
        onClose={() => { setReturnModalOpen(false); setPendingReturnCheckout(null); setReturnConfirmId(""); }}
        title="Confirm Return"
        maxWidth="max-w-md"
        borderColor="border-emerald-200"
      >
        {pendingReturnCheckout && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border border-emerald-100 px-4 py-3 text-xs text-emerald-900 flex items-start gap-2">
              <span className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
              <p>
                For security, please confirm your Personnel ID before we mark this box as returned.
                The ID must match the one used when the box was checked out.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm space-y-1.5">
              <p className="font-semibold text-emerald-900">
                {pendingReturnCheckout.certType} • {getBoxDisplay(pendingReturnCheckout.boxId)}
              </p>
              <p className="text-emerald-900/90">
                <span className="font-semibold">Registry range:</span> {pendingReturnCheckout.registryRange || "—"}
              </p>
              <p className="text-emerald-900/90">
                <span className="font-semibold">Checked out by:</span> {pendingReturnCheckout.personnelName} ({pendingReturnCheckout.personnelId})
              </p>
              <p className="text-[11px] text-emerald-800/80">
                {pendingReturnCheckout.checkoutDate} • {pendingReturnCheckout.checkoutTime}
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-emerald-900 mb-1">
                Your Personnel ID (confirm)
              </label>
              <input
                type="text"
                value={returnConfirmId}
                onChange={(e) => setReturnConfirmId(e.target.value.toUpperCase())}
                placeholder="Re-enter the same Personnel ID"
                className="w-full rounded-xl border-2 border-emerald-200 bg-white/90 pl-4 py-2 text-sm text-gray-900 placeholder:text-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200/80"
              />
              <p className="mt-1 text-[11px] text-emerald-800">
                The button below will enable once the ID exactly matches the one above.
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => { setReturnModalOpen(false); setPendingReturnCheckout(null); setReturnConfirmId(""); }}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReturn}
                disabled={returning || returnConfirmId.trim() !== returnPersonnelId.trim()}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600/80"
              >
                {returning ? "Returning…" : "Confirm Return"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* View check-outs modal */}
      <Modal
        open={viewCheckoutsModalOpen}
        onClose={() => setViewCheckoutsModalOpen(false)}
        title="Check-out box (active checkouts)"
        maxWidth="max-w-2xl"
        borderColor="border-slate-200"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {activeCheckouts.length === 0 ? (
            <p className="text-sm text-gray-500">No boxes currently checked out.</p>
          ) : (
            activeCheckouts.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm"
              >
                <CertificateBadge type={c.certType} compact />
                <span>{getBoxDisplay(c.boxId)} — {c.registryRange || "—"} ({c.monthStr} {c.yearStr})</span>
                <span className="text-gray-600">— checked out by</span>
                <strong>{c.personnelName} ({c.personnelId})</strong>
                <span className="text-gray-500 text-xs">
                  {c.checkoutDate} {c.checkoutTime}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
}
