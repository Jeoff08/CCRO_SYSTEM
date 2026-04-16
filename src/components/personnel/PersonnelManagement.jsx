import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "../ui/index.js";
import { personnelAPI, checkoutsAPI } from "../../api/index.js";

export default function PersonnelManagement() {
  const [personnel, setPersonnel] = useState([]);
  const [activeCheckouts, setActiveCheckouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [personnelId, setPersonnelId] = useState("");
  const [fullName, setFullName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [returnConfirmOpen, setReturnConfirmOpen] = useState(false);
  const [pendingReturnPersonnel, setPendingReturnPersonnel] = useState(null);
  const [pendingReturnCheckouts, setPendingReturnCheckouts] = useState([]);
  const [loadingPendingReturns, setLoadingPendingReturns] = useState(false);
  const [confirmingReturnId, setConfirmingReturnId] = useState(null);
  const personnelIdInputRef = useRef(null);

  const loadPersonnel = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [personnelData, checkoutData] = await Promise.all([
        personnelAPI.getAll(),
        checkoutsAPI.getAll(true),
      ]);
      setPersonnel(personnelData || []);
      setActiveCheckouts(checkoutData || []);
    } catch (err) {
      setError(err?.message || "Failed to load personnel.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersonnel();
  }, [loadPersonnel]);

  useEffect(() => {
    if (addModalOpen) {
      const t = setTimeout(() => personnelIdInputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [addModalOpen]);

  const handleAddPersonnel = async (e) => {
    e.preventDefault();
    const rawId = personnelId?.trim() ?? "";
    const pid = rawId.replace(/\s+/g, " ").trim();
    const name = fullName?.trim() ?? "";
    if (!pid || !name) {
      setError("Personnel ID and Full name are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await personnelAPI.create({ personnelId: pid, fullName: name });
      await loadPersonnel();
      setAddModalOpen(false);
      setPersonnelId("");
      setFullName("");
    } catch (err) {
      setError(err?.message || "Failed to add personnel.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (p) => {
    setPendingDelete(p);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setSaving(true);
    setError("");
    try {
      await personnelAPI.delete(pendingDelete.id);
      await loadPersonnel();
      setDeleteConfirmOpen(false);
      setPendingDelete(null);
    } catch (err) {
      setError(err?.message || "Failed to delete personnel.");
    } finally {
      setSaving(false);
    }
  };

  const handleReturnConfirmClick = async (p) => {
    setPendingReturnPersonnel(p);
    setReturnConfirmOpen(true);
    setPendingReturnCheckouts([]);
    setLoadingPendingReturns(true);
    try {
      const list = await checkoutsAPI.getByPersonnelId(p.personnelId, {
        pendingReturnOnly: true,
      });
      setPendingReturnCheckouts(list || []);
    } catch {
      setPendingReturnCheckouts([]);
    } finally {
      setLoadingPendingReturns(false);
    }
  };

  const handleConfirmReturned = async (checkoutId) => {
    setConfirmingReturnId(checkoutId);
    setError("");
    try {
      await checkoutsAPI.markReturned(checkoutId);
      await loadPersonnel();
      const remaining = pendingReturnCheckouts.filter((c) => c.id !== checkoutId);
      setPendingReturnCheckouts(remaining);
      if (remaining.length === 0) {
        setReturnConfirmOpen(false);
        setPendingReturnPersonnel(null);
      }
    } catch (err) {
      setError(err?.message || "Failed to confirm return.");
    } finally {
      setConfirmingReturnId(null);
    }
  };

  const checkoutCountByPersonnel = activeCheckouts.reduce((acc, c) => {
    const pid = c.personnelId;
    acc[pid] = (acc[pid] || 0) + 1;
    return acc;
  }, {});

  /** Count of checkouts with pending return (submitted from E-Log, awaiting admin confirm) per personnel. */
  const pendingReturnCountByPersonnel = activeCheckouts.reduce((acc, c) => {
    if (!c.pendingReturnAt) return acc;
    const pid = c.personnelId;
    acc[pid] = (acc[pid] || 0) + 1;
    return acc;
  }, {});

  const pidTrimmed = (personnelId?.trim() ?? "").replace(/\s+/g, " ").trim();
  const nameTrimmed = fullName?.trim() || "";
  const hasLetter = /[A-Za-z]/.test(pidTrimmed);
  const hasNumber = /\d/.test(pidTrimmed);
  const isIdFormatValid =
    pidTrimmed.length > 0 && hasLetter && hasNumber &&
    /^[A-Za-z0-9_\-\s]+$/.test(pidTrimmed);
  const isIdValid = pidTrimmed.length > 0 && isIdFormatValid;
  const isNameValid = nameTrimmed.length > 0;
  const isDuplicateId = isIdValid && personnel.some(
    (p) => (p.personnelId ?? "").toLowerCase() === pidTrimmed.toLowerCase()
  );
  const canSubmit = isIdValid && isNameValid && !isDuplicateId && !saving;

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <motion.h2
          className="text-xl font-bold text-gray-900"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: "easeOut" }}
        >
          Personnel Management
        </motion.h2>
        <button
          type="button"
          onClick={() => { setAddModalOpen(true); setPersonnelId(""); setFullName(""); setError(""); }}
          className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 backdrop-blur-sm transition-all duration-300 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-teal-500 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:bg-white/25">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
          Add Personnel
        </button>
      </div>
      <motion.p
        className="text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        Personnel can use their ID in the E-Log to check out and return boxes. Only registered personnel can access the E-Log.
      </motion.p>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            className="flex items-center justify-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-10 h-10 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key="table"
            className="overflow-x-auto rounded-xl border border-slate-200"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Personnel ID</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Full Name</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Check-out Status</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {personnel.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      No personnel registered. Click &ldquo;Add Personnel&rdquo; to add someone.
                    </td>
                  </tr>
                ) : (
                  personnel.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.3), ease: "easeOut" }}
                      className="border-t border-slate-200 transition-colors duration-150 hover:bg-emerald-50/50"
                    >
                    <td className="px-3 py-2.5 font-medium text-slate-800">{p.personnelId}</td>
                    <td className="px-3 py-2.5 text-slate-700">{p.fullName}</td>
                    <td className="px-3 py-2.5">
                      {(checkoutCountByPersonnel[p.personnelId] || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition-all duration-200 hover:bg-amber-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          {checkoutCountByPersonnel[p.personnelId]} box(es)/bundle(s) checked out
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-all duration-200 hover:bg-emerald-100">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          No active check-out
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {(pendingReturnCountByPersonnel[p.personnelId] || 0) > 0 && (
                          <button
                            type="button"
                            onClick={() => handleReturnConfirmClick(p)}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400 hover:shadow-md active:scale-95 transition-all duration-200 shadow-sm"
                            title="Confirm returned"
                          >
                            <svg
                              className="w-3.5 h-3.5 text-emerald-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Confirm returned
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(p)}
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-gray-300 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-md active:scale-95 transition-all duration-200 shadow-sm"
                          title="Delete personnel"
                        >
                          <svg
                            className="w-3.5 h-3.5 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Add personnel modal */}
      <Modal
        open={addModalOpen}
        onClose={() => { setAddModalOpen(false); setPersonnelId(""); setFullName(""); setError(""); }}
        title="Add Personnel"
        maxWidth="max-w-lg"
        borderColor="border-emerald-200"
      >
        <form onSubmit={handleAddPersonnel} className="space-y-6">
          {/* Header strip */}
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50 px-4 py-3 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-3-3-3 3M12 4v12"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-900">
                Register a new team member to use the E-Log for checking out boxes.
              </p>
              <p className="mt-1 text-xs text-emerald-800/80">
                Use a unique Personnel ID: letters, numbers, hyphens, underscores, or spaces (e.g.{" "}
                <span className="font-mono">AB123</span>, <span className="font-mono">AB-123</span>). Must include at least one letter and one number.
              </p>
            </div>
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-5">
            {/* Form fields */}
            <div className="space-y-4">
              <div className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-800 transition-colors group-focus-within:text-emerald-700">
                    Personnel ID
                  </label>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-100">
                    Required
                  </span>
                </div>
                <div className="relative">
                  <input
                    ref={personnelIdInputRef}
                    type="text"
                    value={personnelId}
                    onChange={(e) => {
                      const v = e.target.value;
                      const allowed = v.replace(/[^A-Za-z0-9_\- ]/g, "");
                      setPersonnelId(allowed);
                    }}
                    placeholder="e.g. AB123 or AB-123"
                    className={`w-full rounded-xl border-2 bg-slate-50/60 px-4 py-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-emerald-400/40 focus:outline-none ${
                      isDuplicateId
                        ? "border-red-400 focus:border-red-500"
                        : isIdValid
                        ? "border-emerald-400 focus:border-emerald-500"
                        : "border-slate-200 focus:border-emerald-500"
                    }`}
                    required
                  />
                  {isIdValid && !isDuplicateId && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" aria-hidden>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                  {isDuplicateId && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" aria-hidden>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                {isDuplicateId && (
                  <p className="mt-1.5 text-xs font-medium text-red-600">
                    This ID is already registered. Choose a different one.
                  </p>
                )}
                {!isDuplicateId && pidTrimmed.length > 0 && !isIdFormatValid && (
                  <p className="mt-1.5 text-xs font-medium text-amber-700">
                    ID must include at least one letter and one number. Only letters, numbers, hyphens, underscores, and spaces are allowed.
                  </p>
                )}
              </div>

              <div className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-800 transition-colors group-focus-within:text-emerald-700">
                    Full Name
                  </label>
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 border border-emerald-100">
                    Required
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Juan Dela Cruz"
                    className={`w-full rounded-xl border-2 bg-slate-50/60 px-4 py-3 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-emerald-400/40 focus:outline-none ${
                      isNameValid
                        ? "border-emerald-400 focus:border-emerald-500"
                        : "border-slate-200 focus:border-emerald-500"
                    }`}
                    required
                  />
                  {isNameValid && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" aria-hidden>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Side tips */}
            <div className="hidden md:flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-4 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Quick tips
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-900">
                <li>Use IDs that match staff badges or internal HR codes (e.g. AB-123, EMP 456).</li>
                <li>You can use letters, numbers, hyphens, underscores, and spaces in the ID.</li>
                <li>Names can be full legal name or preferred display name for audit trails.</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => { setAddModalOpen(false); setPersonnelId(""); setFullName(""); setError(""); }}
              className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`inline-flex items-center justify-center rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                canSubmit || saving
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-500/40 hover:-translate-y-0.5"
                  : "bg-slate-300"
              }`}
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Adding…
                </span>
              ) : (
                "Add Personnel"
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setPendingDelete(null); }}
        title="Delete Personnel"
        maxWidth="max-w-lg"
        borderColor="border-red-200"
      >
        {pendingDelete && (
          <div className="space-y-6">
            {/* Warning banner */}
            <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl px-5 py-4 shadow-sm">
              <p className="text-sm text-red-900 font-semibold leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-bold text-red-950">
                  {pendingDelete.fullName} ({pendingDelete.personnelId})
                </span>
                ?
              </p>
            </div>

            {/* Personnel information card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-5 py-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Personnel Information
                </h4>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Personnel ID
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {pendingDelete.personnelId}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Full Name
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {pendingDelete.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Check-out Status
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {(checkoutCountByPersonnel[pendingDelete.personnelId] || 0) > 0
                          ? `${checkoutCountByPersonnel[pendingDelete.personnelId]} box(es)/bundle(s) checked out`
                          : "No active check-outs"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Permanent warning */}
            <div className="flex items-start gap-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl px-5 py-4 shadow-sm">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-amber-900 leading-relaxed">
                  <span className="font-bold">Warning:</span> This will permanently delete this personnel record
                  from the system. This action cannot be undone.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t-2 border-gray-100">
              <button
                type="button"
                onClick={() => { setDeleteConfirmOpen(false); setPendingDelete(null); }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 min-w-[100px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/40 hover:from-red-700 hover:to-red-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 min-w-[140px] disabled:opacity-50"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                {saving ? "Deleting…" : "Delete Personnel"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm returned modal */}
      <Modal
        open={returnConfirmOpen}
        onClose={() => { setReturnConfirmOpen(false); setPendingReturnPersonnel(null); setPendingReturnCheckouts([]); }}
        title="Confirm Returned"
        maxWidth="max-w-lg"
        borderColor="border-emerald-200"
      >
        {pendingReturnPersonnel && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-900">
              <p className="font-semibold">
                {pendingReturnPersonnel.fullName} ({pendingReturnPersonnel.personnelId})
              </p>
              <p className="mt-1 text-emerald-800/90">
                Select a box/bundle below to confirm it has been returned.
              </p>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {loadingPendingReturns ? (
                <div className="flex items-center justify-center gap-2 py-6 text-slate-600">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                  Loading pending returns…
                </div>
              ) : pendingReturnCheckouts.length === 0 ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  No boxes pending return. The personnel must submit a return from the E-Log first; only those will appear here.
                </p>
              ) : (
                pendingReturnCheckouts.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-800 truncate">
                        {c.certType} • Box {c.boxId}
                      </p>
                      <p className="text-xs text-slate-600">
                        {c.registryRange || "—"} ({c.monthStr} {c.yearStr})
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleConfirmReturned(c.id)}
                      disabled={confirmingReturnId === c.id}
                      className="flex-shrink-0 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-all duration-200"
                    >
                      {confirmingReturnId === c.id ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Confirming…
                        </>
                      ) : (
                        "Confirm"
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setReturnConfirmOpen(false); setPendingReturnPersonnel(null); }}
                className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
