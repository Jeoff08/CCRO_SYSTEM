import React, { useMemo, useState, useEffect } from "react";
import CertificateBadge from "../shared/CertificateBadge.jsx";
import { Modal, Toast } from "../ui/index.js";
import BoxForm from "./BoxForm.jsx";
import ConfirmBoxStep from "./ConfirmBoxStep.jsx";
import DeleteBoxModal from "./DeleteBoxModal.jsx";
import ViewBoxModal from "./ViewBoxModal.jsx";
import { MONTHS, CERT_TYPES } from "../../constants/index.js";
import { DEFAULT_SHELF_LETTERS_BY_BAY, DEFAULT_ROW_LABELS } from "../../constants/index.js";
import { getShelfLetter } from "../../utils/index.js";

export default function BoxManagement({
  boxes,
  onAdd,
  onUpdate,
  onDelete,
  addLog,
  shelfLettersByBay,
  rowLabels,
}) {
  const shelfMap = shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY;
  const rowLabelsMap = rowLabels || DEFAULT_ROW_LABELS;
  const [editingBox, setEditingBox] = useState(null);
  const [showAddBoxModal, setShowAddBoxModal] = useState(false);
  const [modalStep, setModalStep] = useState("form"); // 'form' | 'confirm'
  const [pendingBoxPayload, setPendingBoxPayload] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [certificateTypeFilter, setCertificateTypeFilter] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Auto-dismiss success toast
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, certificateTypeFilter]);

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
    const payload = {
      ...pendingBoxPayload,
      id: pendingBoxPayload.id || crypto.randomUUID(),
    };
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

  const sortedBoxes = useMemo(
    () =>
      [...boxes].sort((a, b) => {
        const na = Number(a.boxNumber);
        const nb = Number(b.boxNumber);
        if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
        if (String(a.boxNumber) !== String(b.boxNumber))
          return String(a.boxNumber).localeCompare(String(b.boxNumber));
        if (a.bay !== b.bay) return a.bay - b.bay;
        if (a.shelf !== b.shelf) return a.shelf - b.shelf;
        return a.row - b.row;
      }),
    [boxes]
  );

  const filteredBoxes = useMemo(() => {
    let filtered = sortedBoxes;
    
    // Filter by certificate type
    if (certificateTypeFilter) {
      filtered = filtered.filter((box) => box.certificateType === certificateTypeFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = filtered.filter((box) => {
        const fields = [
          String(box.boxNumber ?? ""),
          String(box.bay ?? ""),
          getShelfLetter(shelfMap, box.bay, box.shelf),
          String(box.row ?? ""),
          String(box.certificateType ?? ""),
          String(box.year ?? ""),
          String(box.yearTo ?? ""),
          MONTHS[box.monthIndex] ?? "",
          String(box.registryRange ?? ""),
          String(box.remark ?? ""),
        ];
        return fields.some((f) => f.toLowerCase().includes(q));
      });
    }
    
    return filtered;
  }, [sortedBoxes, searchQuery, certificateTypeFilter, shelfMap]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBoxes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBoxes = useMemo(
    () => filteredBoxes.slice(startIndex, endIndex),
    [filteredBoxes, startIndex, endIndex]
  );

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <Toast
        variant="success"
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />

      {/* Header */}
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
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add box
        </button>
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={showAddBoxModal}
        onClose={closeModal}
        title={
          modalStep === "confirm"
            ? "Confirm box details"
            : editingBox
            ? "Edit Box"
            : "Add New Box"
        }
        maxWidth="max-w-4xl"
      >
        {modalStep === "form" && (
          <BoxForm
            key={editingBox?.id || (pendingBoxPayload ? "prefill" : "new")}
            editingBox={editingBox}
            prefillPayload={pendingBoxPayload && !editingBox ? pendingBoxPayload : undefined}
            onSaved={handleSave}
            onCancel={closeModal}
            existingBoxes={boxes}
            shelfLettersByBay={shelfMap}
            rowLabels={rowLabelsMap}
          />
        )}
        {modalStep === "confirm" && pendingBoxPayload && (
          <ConfirmBoxStep
            payload={pendingBoxPayload}
            onBack={() => setModalStep("form")}
            onConfirm={handleConfirmAdd}
            shelfLettersByBay={shelfMap}
          />
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <DeleteBoxModal
        box={deleteTarget}
        shelfLettersByBay={shelfMap}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* View box details modal */}
      <ViewBoxModal
        box={viewTarget}
        shelfLettersByBay={shelfMap}
        rowLabels={rowLabelsMap}
        onClose={() => setViewTarget(null)}
      />

      {/* Box table */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 max-h-[45rem] overflow-hidden flex flex-col shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            Registered Boxes
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={certificateTypeFilter}
              onChange={(e) => setCertificateTypeFilter(e.target.value)}
              className="rounded-xl bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 border-2 border-emerald-200/60 hover:border-emerald-300 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <option value="">All Certificate Types</option>
              {CERT_TYPES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boxes..."
              className="rounded-xl bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 min-w-[10rem] shadow-sm hover:shadow-md transition-all duration-200"
            />
            {(searchQuery || certificateTypeFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCertificateTypeFilter("");
                }}
                className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-200/60 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md active:scale-95 transition-all duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-gray-500 mb-2">
          Showing {filteredBoxes.length === 0 ? 0 : startIndex + 1}–{Math.min(endIndex, filteredBoxes.length)} of {filteredBoxes.length} record{filteredBoxes.length === 1 ? "" : "s"}
          {(searchQuery.trim() || certificateTypeFilter) ? ` (filtered from ${sortedBoxes.length})` : ""}
        </p>

        <div className="overflow-auto custom-scrollbar -mx-2 px-2 flex-1 min-h-0">
          {filteredBoxes.length === 0 ? (
            <p className="text-xs text-gray-500">
              {searchQuery.trim()
                ? "No boxes match your search. Try different terms or clear the search."
                : 'No boxes registered yet. Click "Add box" to register a box.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[max-content]">
                <thead>
                  <tr className="border-b border-emerald-200 bg-emerald-50/70">
                    <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Box #</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Month (From – To)</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Year</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Certificate Type</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Registry Range</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Remark</th>
                    <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBoxes.map((box) => (
                      <tr
                        key={box.id}
                        className="border-b border-emerald-100/50 bg-white hover:bg-gradient-to-r hover:from-emerald-50/80 hover:to-sky-50/60 hover:shadow-sm transition-all duration-200 group cursor-pointer"
                      >
                        <td className="px-4 py-3 text-gray-900 whitespace-nowrap font-semibold group-hover:text-emerald-700 transition-colors">
                          {box.boxNumber != null && box.boxNumber !== "" ? box.boxNumber : "—"}
                        </td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                          {box.monthIndex != null
                            ? box.monthIndexTo != null && box.monthIndexTo !== box.monthIndex
                              ? `${MONTHS[box.monthIndex]} – ${MONTHS[box.monthIndexTo]}`
                              : MONTHS[box.monthIndex]
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
                              onClick={(e) => { e.stopPropagation(); setViewTarget(box); }}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-gray-300 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-md active:scale-95 transition-all duration-200 shadow-sm"
                              title="View details"
                            >
                              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); startEdit(box); }}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-gray-300 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-md active:scale-95 transition-all duration-200 shadow-sm"
                              title="Edit box"
                            >
                              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Update
                            </button>
                            {onDelete && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setDeleteTarget(box); }}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-gray-300 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-400 hover:shadow-md active:scale-95 transition-all duration-200 shadow-sm"
                                title="Delete box"
                              >
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

        {/* Pagination Controls */}
        {filteredBoxes.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-emerald-200/50">
            <div className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-200/60 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-emerald-200/60"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => goToPage(page)}
                        className={`inline-flex items-center justify-center rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-md shadow-emerald-500/40"
                            : "border-2 border-emerald-200/60 bg-white text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md active:scale-95"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-xs text-gray-400">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
              </div>

              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center justify-center rounded-xl border-2 border-emerald-200/60 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-emerald-200/60"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
