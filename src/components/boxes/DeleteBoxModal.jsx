import React from "react";
import { getShelfLetter } from "../../utils/index.js";

export default function DeleteBoxModal({
  box,
  shelfLettersByBay,
  onConfirm,
  onCancel,
}) {
  if (!box) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-box-modal-title"
      aria-describedby="delete-box-modal-description"
    >
      <div
        className="bg-white rounded-3xl border-2 border-red-200 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-red-100 bg-gradient-to-r from-red-50 to-red-50/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg shadow-red-500/30 flex-shrink-0">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3
                  id="delete-box-modal-title"
                  className="text-xl font-bold text-gray-900 tracking-tight"
                >
                  Confirm Deletion
                </h3>
                <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full p-2 text-gray-400 hover:bg-red-50 hover:text-gray-600 transition-colors flex-shrink-0"
              aria-label="Close dialog"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl px-5 py-4 shadow-sm" id="delete-box-modal-description">
            <p className="text-sm text-red-900 font-semibold leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-red-950">Box #{box.boxNumber}</span>?
            </p>
          </div>

          {/* Box Information */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-50/50 rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600 to-gray-700 px-5 py-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Box Information
              </h4>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</p>
                    <p className="text-sm font-bold text-gray-900">
                      B-{box.bay} • {getShelfLetter(shelfLettersByBay, box.bay, box.shelf)} • R-{box.row}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Certificate Type</p>
                    <p className="text-sm font-bold text-gray-900">
                      {box.certificateType}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Year Range</p>
                    <p className="text-sm font-bold text-gray-900">
                      {box.yearTo ? `${box.year} – ${box.yearTo}` : box.year}
                    </p>
                  </div>
                  {box.registryRange && (
                    <div>
                      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Registry Range</p>
                      <p className="text-sm font-bold text-gray-900">
                        {box.registryRange}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Permanent Warning */}
          <div className="flex items-start gap-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl px-5 py-4 shadow-sm">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-amber-900 leading-relaxed">
                <span className="font-bold">Warning:</span> This will permanently delete the box record from the system. 
                This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 min-w-[100px]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/40 hover:from-red-700 hover:to-red-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 min-w-[140px]"
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
              Delete Box
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
