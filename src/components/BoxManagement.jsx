import React, { useMemo, useState, useEffect } from "react";
import CertificateBadge from "./CertificateBadge.jsx";

const CERT_TYPES = [
  { code: "COLB", label: "Birth (COLB)" },
  { code: "COM", label: "Marriage (COM)" },
  { code: "COD", label: "Death (COD)" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1944 + 1 }, (_, i) => 1944 + i); // 1944–current year
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DEFAULT_SHELF_LETTERS_BY_BAY = {
  1: ["S-A", "S-B"],
  2: ["S-A", "S-C", "S-B", "S-D"],
  3: ["S-A", "S-C", "S-B", "S-D"],
  4: ["S-A", "S-C", "S-B", "S-D"],
  5: ["S-A", "S-C", "S-B", "S-D"],
  6: ["S-A", "S-B"],
};

function getShelfLetter(shelfLettersByBay, bay, shelfNumber) {
  return shelfLettersByBay[bay]?.[shelfNumber - 1] || `S-${shelfNumber}`;
}

function getShelfNumberFromLetter(shelfLettersByBay, bay, letter) {
  const mapping = shelfLettersByBay[bay];
  if (!mapping) return null;
  const index = mapping.findIndex((l) => l === letter);
  return index >= 0 ? index + 1 : null;
}

export default function BoxManagement({ boxes, onAdd, onUpdate, onDelete, addLog, shelfLettersByBay }) {
  const shelfMap = shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY;
  const [editingBox, setEditingBox] = useState(null);
  const [showAddBoxModal, setShowAddBoxModal] = useState(false);
  const [modalStep, setModalStep] = useState("form"); // 'form' | 'confirm'
  const [pendingBoxPayload, setPendingBoxPayload] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); // box to delete (confirmation modal)

  const handleSave = async (payload) => {
    if (editingBox) {
      try {
        await onUpdate(payload);
        if (addLog) {
          addLog(
            "box-edit",
            `Box ${payload.boxNumber} updated (Bay ${payload.bay}, Shelf ${getShelfLetter(shelfMap, payload.bay, payload.shelf)}, Row ${payload.row}).`
          );
        }
        setShowAddBoxModal(false);
        setSuccessMessage(`Box ${payload.boxNumber} updated successfully!`);
      } catch (error) {
        console.error("Failed to update box:", error);
      }
    } else {
      setPendingBoxPayload(payload);
      setModalStep("confirm");
    }
  };

  const handleConfirmAdd = async () => {
    if (!pendingBoxPayload) return;
    const payload = { ...pendingBoxPayload, id: pendingBoxPayload.id || crypto.randomUUID() };
    try {
      await onAdd(payload);
      if (addLog) {
        addLog(
          "box-add",
          `Box ${payload.boxNumber} created (Bay ${payload.bay}, Shelf ${getShelfLetter(shelfMap, payload.bay, payload.shelf)}, Row ${payload.row}).`
        );
      }
      setShowAddBoxModal(false);
      setSuccessMessage(`Box ${payload.boxNumber} added successfully!`);
    } catch (error) {
      console.error("Failed to create box:", error);
    }
  };

  const startEdit = (box) => {
    setEditingBox(box);
    setPendingBoxPayload(null);
    setModalStep("form");
    setShowAddBoxModal(true);
  };

  const openAddModal = () => {
    setEditingBox(null);
    setPendingBoxPayload(null);
    setModalStep("form");
    setShowAddBoxModal(true);
  };

  const closeModal = () => {
    setShowAddBoxModal(false);
    setEditingBox(null);
    setModalStep("form");
    setPendingBoxPayload(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDelete) return;
    try {
      await onDelete(deleteTarget.id);
      if (addLog) {
        addLog(
          "box-delete",
          `Box ${deleteTarget.boxNumber} deleted (Bay ${deleteTarget.bay}, Shelf ${getShelfLetter(shelfMap, deleteTarget.bay, deleteTarget.shelf)}, Row ${deleteTarget.row}).`
        );
      }
      setSuccessMessage(`Box ${deleteTarget.boxNumber} deleted successfully!`);
    } catch (error) {
      console.error("Failed to delete box:", error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const backToForm = () => {
    setModalStep("form");
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const sortedBoxes = useMemo(
    () =>
      [...boxes].sort((a, b) => {
        const na = Number(a.boxNumber);
        const nb = Number(b.boxNumber);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
        if (String(a.boxNumber) !== String(b.boxNumber)) return String(a.boxNumber).localeCompare(String(b.boxNumber));
        if (a.bay !== b.bay) return a.bay - b.bay;
        if (a.shelf !== b.shelf) return a.shelf - b.shelf;
        return a.row - b.row;
      }),
    [boxes]
  );

  const filteredBoxes = useMemo(() => {
    if (!searchQuery.trim()) return sortedBoxes;
    const q = searchQuery.trim().toLowerCase();
    return sortedBoxes.filter((box) => {
      const boxNum = String(box.boxNumber ?? "");
      const bay = String(box.bay ?? "");
      const shelf = getShelfLetter(shelfMap, box.bay, box.shelf);
      const row = String(box.row ?? "");
      const cert = String(box.certificateType ?? "").toLowerCase();
      const year = String(box.year ?? "");
      const yearTo = String(box.yearTo ?? "");
      const month = MONTHS[box.monthIndex] ?? "";
      const registry = String(box.registryRange ?? "").toLowerCase();
      const remark = String(box.remark ?? "").toLowerCase();
      return (
        boxNum.toLowerCase().includes(q) ||
        bay.includes(q) ||
        shelf.toLowerCase().includes(q) ||
        row.includes(q) ||
        cert.includes(q) ||
        year.includes(q) ||
        yearTo.includes(q) ||
        month.toLowerCase().includes(q) ||
        registry.includes(q) ||
        remark.includes(q)
      );
    });
  }, [sortedBoxes, searchQuery, shelfMap]);

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="bg-white rounded-xl border-2 border-emerald-400 shadow-2xl shadow-emerald-500/30 px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-md">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 flex-1">{successMessage}</p>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Box Management
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Register and maintain box records to keep document locations
            synchronized with physical storage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add box
          </button>
        </div>
      </div>

      {showAddBoxModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-box-modal-title"
        >
          <div
            className="bg-white rounded-3xl border-2 border-emerald-200/50 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 md:p-6 border-b border-emerald-100 flex items-center justify-between">
              <h3 id="add-box-modal-title" className="text-sm font-semibold text-gray-900">
                {modalStep === "confirm" && "Confirm box details"}
                {modalStep === "form" && (editingBox ? "Edit Box" : "Add New Box")}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1.5 text-gray-500 hover:bg-emerald-50 hover:text-gray-700"
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <span aria-hidden>×</span>
              </button>
            </div>
            <div className="p-5 md:p-6">
              {modalStep === "form" && (
                <BoxForm
                  key={editingBox?.id || (pendingBoxPayload ? "prefill" : "new")}
                  editingBox={editingBox}
                  prefillPayload={pendingBoxPayload && !editingBox ? pendingBoxPayload : undefined}
                  onSaved={handleSave}
                  onCancel={closeModal}
                  existingBoxes={boxes}
                  shelfLettersByBay={shelfMap}
                />
              )}
              {modalStep === "confirm" && pendingBoxPayload && (
                <ConfirmBoxStep
                  payload={pendingBoxPayload}
                  onBack={backToForm}
                  onConfirm={handleConfirmAdd}
                  shelfLettersByBay={shelfMap}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setDeleteTarget(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-box-modal-title"
        >
          <div
            className="bg-white rounded-3xl border-2 border-red-200/50 shadow-2xl max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 md:p-6 border-b border-red-100 flex items-center justify-between">
              <h3 id="delete-box-modal-title" className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                Confirm Deletion
              </h3>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-full p-1.5 text-gray-500 hover:bg-red-50 hover:text-gray-700"
                aria-label="Close"
              >
                <span aria-hidden>×</span>
              </button>
            </div>
            <div className="p-5 md:p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to delete <span className="font-bold text-gray-900">Box #{deleteTarget.boxNumber}</span>?
              </p>
              <div className="rounded-xl border border-red-100 bg-red-50/60 p-3 text-xs text-gray-600 space-y-1">
                <p><span className="font-semibold text-gray-700">Bay:</span> {deleteTarget.bay}</p>
                <p><span className="font-semibold text-gray-700">Shelf:</span> {getShelfLetter(shelfMap, deleteTarget.bay, deleteTarget.shelf)}</p>
                <p><span className="font-semibold text-gray-700">Row / Level:</span> {deleteTarget.row}</p>
                <p><span className="font-semibold text-gray-700">Certificate:</span> {deleteTarget.certificateType}</p>
                <p><span className="font-semibold text-gray-700">Year:</span> {deleteTarget.yearTo ? `${deleteTarget.year} – ${deleteTarget.yearTo}` : deleteTarget.year}</p>
              </div>
              <div className="flex border-l-4 border-amber-500 bg-amber-50/60 rounded-r-xl py-3 pl-4 pr-3">
                <p className="text-xs text-amber-900/90">
                  This action cannot be undone. The box record will be permanently removed.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-red-700 hover:to-red-600 active:scale-[0.98] transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Box
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className=" rounded-3xl p-5 bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 max-h-[28rem] overflow-hidden flex flex-col shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              Registered Boxes
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search boxes..."
                className="rounded-xl bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 min-w-[10rem] shadow-sm hover:shadow-md transition-all duration-200"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-200/60 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md active:scale-95 transition-all duration-200"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mb-2">
            {filteredBoxes.length} record{filteredBoxes.length === 1 ? "" : "s"}
            {searchQuery.trim() ? ` (filtered from ${sortedBoxes.length})` : ""}
          </p>

          <div className="overflow-auto custom-scrollbar -mx-2 px-2 flex-1 min-h-0">
            {filteredBoxes.length === 0 ? (
              <p className="text-xs text-gray-500">
                {searchQuery.trim()
                  ? "No boxes match your search. Try different terms or clear the search."
                  : "No boxes registered yet. Click \"Add box\" to register a box."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[max-content]">
                  <thead>
                    <tr className="border-b border-emerald-200 bg-emerald-50/70">
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Box #</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Bay</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Shelf</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Row / Level</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Month (From – To)</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Year</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Certificate Type</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Registry Range</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Remark</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBoxes.map((box) => (
                      <tr
                        key={box.id}
                        className="border-b border-emerald-100/50 bg-white hover:bg-gradient-to-r hover:from-emerald-50/80 hover:to-sky-50/60 hover:shadow-sm transition-all duration-200 group cursor-pointer"
                      >
                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap font-semibold group-hover:text-emerald-700 transition-colors">{box.boxNumber != null && box.boxNumber !== "" ? box.boxNumber : "—"}</td>
                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap font-medium group-hover:text-emerald-700 transition-colors">{box.bay}</td>
                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap font-medium group-hover:text-emerald-700 transition-colors">{getShelfLetter(shelfMap, box.bay, box.shelf)}</td>
                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap font-medium group-hover:text-emerald-700 transition-colors">{box.row}</td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                          {box.monthIndex != null
                            ? (box.monthIndexTo != null && box.monthIndexTo !== box.monthIndex
                                ? `${MONTHS[box.monthIndex]} – ${MONTHS[box.monthIndexTo]}`
                                : MONTHS[box.monthIndex])
                            : "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                          {box.yearTo != null ? `${box.year} – ${box.yearTo}` : box.year}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          {box.certificateType ? (
                            <CertificateBadge type={box.certificateType} compact />
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">{box.registryRange || "—"}</td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">{box.remark || "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                startEdit(box);
                              }}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md shadow-emerald-500/30"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Update
                            </button>
                            {onDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(box);
                                }}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-3 py-1.5 text-[11px] font-bold text-white hover:from-red-700 hover:to-red-600 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md shadow-red-500/30"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

function ConfirmBoxStep({ payload, onBack, onConfirm, shelfLettersByBay }) {
  const yearLabel = payload.yearTo != null ? `${payload.year} – ${payload.yearTo}` : String(payload.year);
  const monthLabel = payload.monthIndexTo != null && payload.monthIndexTo !== payload.monthIndex
    ? `${MONTHS[payload.monthIndex]} – ${MONTHS[payload.monthIndexTo]}`
    : MONTHS[payload.monthIndex];
  const rows = [
    { label: "Certificate type", value: <CertificateBadge type={payload.certificateType} compact /> },
    { label: "Year", value: yearLabel },
    { label: "Month", value: monthLabel },
    { label: "Box #", value: payload.boxNumber },
    { label: "Bay", value: payload.bay },
    { label: "Shelf", value: getShelfLetter(shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY, payload.bay, payload.shelf) },
    { label: "Row / Level", value: payload.row },
    { label: "Registry range", value: payload.registryRange || "—" },
    { label: "Remark", value: payload.remark || "—" },
  ];
  return (
    <div className="space-y-5">
      <div className="flex border-l-4 border-amber-500 bg-amber-50/60 rounded-r-xl py-3 pl-4 pr-3">
        <p className="text-sm text-amber-900/90">
          Verify this matches the physical box label before confirming.
        </p>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden shadow-inner">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/80">
                <th className="px-4 py-2.5 font-semibold text-stone-500 uppercase tracking-wider w-36">Field</th>
                <th className="px-4 py-2.5 font-semibold text-stone-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ label, value }) => (
                <tr key={label} className="border-b border-stone-100 last:border-b-0">
                  <td className="px-4 py-2.5 text-stone-500 font-medium">{label}</td>
                  <td className="px-4 py-2.5 text-stone-900 font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-end pt-1">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center rounded-lg border-2 border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition"
        >
          Back to edit
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 active:scale-[0.98] transition"
        >
          Confirm and add box
        </button>
      </div>
    </div>
  );
}

export function BoxForm({ editingBox, prefillPayload, onSaved, onCancel, existingBoxes, shelfLettersByBay }) {
  const shelfMap = shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY;
  const source = editingBox || prefillPayload || {};
  const [certificateType, setCertificateType] = useState(source.certificateType || "");
  const [year, setYear] = useState(source.year !== undefined && source.year !== null ? String(source.year) : "");
  const [yearTo, setYearTo] = useState(source.yearTo !== undefined && source.yearTo !== null ? String(source.yearTo) : "");
  const [monthIndex, setMonthIndex] = useState(source.monthIndex ?? null);
  const [monthIndexTo, setMonthIndexTo] = useState(source.monthIndexTo ?? null);
  const [boxNumber, setBoxNumber] = useState(source.boxNumber !== undefined && source.boxNumber !== null ? String(source.boxNumber) : "");
  const [bay, setBay] = useState(source.bay !== undefined && source.bay !== null ? String(source.bay) : "");
  const initialShelfLetter =
    source.shelf !== undefined && source.shelf !== null && source.bay !== undefined && source.bay !== null
      ? getShelfLetter(shelfMap, source.bay, source.shelf)
      : "";
  const [shelfLetter, setShelfLetter] = useState(initialShelfLetter);
  const [row, setRow] = useState(source.row !== undefined && source.row !== null ? String(source.row) : "");
  const [registryRange, setRegistryRange] = useState(source.registryRange || "");
  const [remark, setRemark] = useState(source.remark || "");
  const [error, setError] = useState("");

  // Update form fields when editingBox changes
  useEffect(() => {
    if (editingBox) {
      setCertificateType(editingBox.certificateType || "");
      setYear(editingBox.year !== undefined && editingBox.year !== null ? String(editingBox.year) : "");
      setYearTo(editingBox.yearTo !== undefined && editingBox.yearTo !== null ? String(editingBox.yearTo) : "");
      setMonthIndex(editingBox.monthIndex ?? null);
      setMonthIndexTo(editingBox.monthIndexTo ?? null);
      setBoxNumber(editingBox.boxNumber !== undefined && editingBox.boxNumber !== null ? String(editingBox.boxNumber) : "");
      setBay(editingBox.bay !== undefined && editingBox.bay !== null ? String(editingBox.bay) : "");
      const shelfLetterValue = editingBox.shelf !== undefined && editingBox.shelf !== null && editingBox.bay !== undefined && editingBox.bay !== null
        ? getShelfLetter(shelfMap, editingBox.bay, editingBox.shelf)
        : "";
      setShelfLetter(shelfLetterValue);
      setRow(editingBox.row !== undefined && editingBox.row !== null ? String(editingBox.row) : "");
      setRegistryRange(editingBox.registryRange || "");
      setRemark(editingBox.remark || "");
      setError("");
    } else if (prefillPayload) {
      // Handle prefill payload (from confirmation step back to form)
      setCertificateType(prefillPayload.certificateType || "");
      setYear(prefillPayload.year !== undefined && prefillPayload.year !== null ? String(prefillPayload.year) : "");
      setYearTo(prefillPayload.yearTo !== undefined && prefillPayload.yearTo !== null ? String(prefillPayload.yearTo) : "");
      setMonthIndex(prefillPayload.monthIndex ?? null);
      setMonthIndexTo(prefillPayload.monthIndexTo ?? null);
      setBoxNumber(prefillPayload.boxNumber !== undefined && prefillPayload.boxNumber !== null ? String(prefillPayload.boxNumber) : "");
      setBay(prefillPayload.bay !== undefined && prefillPayload.bay !== null ? String(prefillPayload.bay) : "");
      const shelfLetterValue = prefillPayload.shelf !== undefined && prefillPayload.shelf !== null && prefillPayload.bay !== undefined && prefillPayload.bay !== null
        ? getShelfLetter(shelfMap, prefillPayload.bay, prefillPayload.shelf)
        : "";
      setShelfLetter(shelfLetterValue);
      setRow(prefillPayload.row !== undefined && prefillPayload.row !== null ? String(prefillPayload.row) : "");
      setRegistryRange(prefillPayload.registryRange || "");
      setRemark(prefillPayload.remark || "");
      setError("");
    }
  }, [editingBox, prefillPayload, shelfMap]);

  useEffect(() => {
    if (!bay) {
      setShelfLetter("");
      return;
    }
    const bayNum = Number(bay);
    const allowedShelves = shelfMap[bayNum];
    if (!allowedShelves || (shelfLetter && !allowedShelves.includes(shelfLetter))) {
      setShelfLetter("");
    }
  }, [bay, shelfLetter, shelfMap]);

  const bayNumForShelves = Number(bay);
  const availableShelves =
    Number.isNaN(bayNumForShelves) || !bay ? [] : shelfMap[bayNumForShelves] || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      !certificateType ||
      !year ||
      monthIndex == null ||
      !boxNumber ||
      !bay ||
      !shelfLetter ||
      !row
    ) {
      setError("All fields except Year To, Month To, registry range, and remark are required.");
      return;
    }

    if (yearTo !== "" && Number(yearTo) < Number(year)) {
      setError("Year To must be the same as or after Year (From).");
      return;
    }

    if (monthIndexTo != null && monthIndexTo < monthIndex) {
      setError("Month To must be the same as or after Month From.");
      return;
    }

    if (!/^\d{1,3}$/.test(String(boxNumber))) {
      setError("Box number must be numeric.");
      return;
    }

    const bayNum = Number(bay);
    const rowNum = Number(row);
    const shelfNum = getShelfNumberFromLetter(shelfMap, bayNum, shelfLetter);

    if (
      bayNum < 1 ||
      bayNum > 6 ||
      shelfNum == null ||
      rowNum < 1 ||
      rowNum > 6
    ) {
      setError(
        "Bay must be 1–6, shelf must match the bay's letters, and Row/Level 1–6 to match physical layout."
      );
      return;
    }

    // Validate registry range format if provided (must be "number-number", e.g. "1-100")
    if (registryRange.trim()) {
      const rangePattern = /^\d+-\d+$/;
      if (!rangePattern.test(registryRange.trim())) {
        setError("Registry Number Range must be in the format: start-end (e.g., 1-100).");
        return;
      }
      const [startStr, endStr] = registryRange.trim().split("-");
      const rangeStart = Number(startStr);
      const rangeEnd = Number(endStr);
      if (rangeStart <= 0 || rangeEnd <= 0) {
        setError("Registry Number Range values must be greater than 0.");
        return;
      }
      if (rangeStart > rangeEnd) {
        setError("Registry Number Range start must not be greater than the end (e.g., 1-100, not 100-1).");
        return;
      }
    }

    const duplicate = existingBoxes.find(
      (b) =>
        b.id !== editingBox?.id &&
        b.bay === bayNum &&
        b.shelf === shelfNum &&
        b.row === rowNum &&
        b.boxNumber === Number(boxNumber)
    );

    if (duplicate) {
      setError(
        "A box with the same number already exists on this bay, shelf, and row/level."
      );
      return;
    }

    const payload = {
      id: editingBox?.id || crypto.randomUUID(),
      certificateType,
      year: Number(year),
      yearTo: yearTo !== "" ? Number(yearTo) : null,
      monthIndex,
      monthIndexTo: monthIndexTo ?? null,
      boxNumber: Number(boxNumber),
      bay: bayNum,
      shelf: shelfNum,
      row: rowNum,
      registryRange: registryRange.trim() || null,
      remark: remark.trim() || null,
    };

    onSaved(payload);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-2 border-emerald-200/50 rounded-3xl p-6 md:p-7 bg-gradient-to-br from-white via-emerald-50/20 to-sky-50/10 space-y-5 shadow-xl shadow-emerald-100/30"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            {editingBox ? "Edit Box" : "Add New Box"}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed bg-white/60 rounded-lg px-3 py-2 border border-emerald-100/50">
            Required: type, year, Month From, box number, bay, shelf, row. You can select one or a range: e.g. January to February, 2025 to 2026. Year To and Month To are optional.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Certificate Type">
          <select
            value={certificateType}
            onChange={(e) => setCertificateType(e.target.value)}
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select type</option>
            {CERT_TYPES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Year (From)">
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Year (To) optional">
          <select
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Same as From or leave empty (e.g. 2025 to 2026)</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Month (From)">
          <select
            value={monthIndex ?? ""}
            onChange={(e) =>
              setMonthIndex(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select month</option>
            {MONTHS.map((m, index) => (
              <option key={m} value={index}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Month (To) optional">
          <select
            value={monthIndexTo ?? ""}
            onChange={(e) =>
              setMonthIndexTo(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Same or after From (e.g. January to February)</option>
            {MONTHS.map((m, index) => (
              <option key={m} value={index}>
                {m}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Box Number">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={boxNumber}
            onChange={(e) =>
              setBoxNumber(e.target.value.replace(/[^\d]/g, ""))
            }
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g., 3"
          />
        </Field>

        <Field label="Bay (1–6)">
          <input
            type="number"
            min={1}
            max={6}
            value={bay}
            onChange={(e) => setBay(e.target.value)}
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </Field>

        <Field label="Shelf (letters)">
          <select
            value={shelfLetter}
            onChange={(e) => setShelfLetter(e.target.value)}
            disabled={!bay}
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:text-gray-400 disabled:bg-gray-50"
          >
            <option value="">{bay ? "Select shelf letter" : "Select bay first"}</option>
            {availableShelves.map((letter) => (
              <option key={letter} value={letter}>
                {letter}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Row / Level (1–6)">
          <input
            type="number"
            min={1}
            max={6}
            value={row}
            onChange={(e) => setRow(e.target.value)}
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </Field>

        <Field label="Registry Number Range">
          <input
            type="text"
            value={registryRange}
            onChange={(e) => {
              // Allow only digits and a single dash (e.g. "1-100")
              const val = e.target.value.replace(/[^\d-]/g, "");
              // Prevent multiple dashes
              const parts = val.split("-");
              const sanitized = parts.length > 2 ? parts[0] + "-" + parts.slice(1).join("") : val;
              setRegistryRange(sanitized);
            }}
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g., 1-100"
          />
        </Field>

        <Field label="Remark">
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g., notes or comments"
          />
        </Field>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-gray-500 max-w-xs">
          Validation prevents duplicate box numbers within the same bay, shelf,
          and row/level.
        </p>
        <div className="flex gap-2">
            {editingBox && (
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/40 hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={editingBox ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"} />
              </svg>
              {editingBox ? "Update" : "Add box"}
            </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

