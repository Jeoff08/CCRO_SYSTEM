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
    >
      <div
        className="bg-white rounded-3xl border-2 border-red-200/50 shadow-2xl max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 md:p-6 border-b border-red-100 flex items-center justify-between">
          <h3
            id="delete-box-modal-title"
            className="text-sm font-semibold text-gray-900 flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            Confirm Deletion
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full p-1.5 text-gray-500 hover:bg-red-50 hover:text-gray-700"
            aria-label="Close"
          >
            <span aria-hidden>×</span>
          </button>
        </div>
        <div className="p-5 md:p-6 space-y-4">
          <p className="text-sm text-gray-700">
            Are you sure you want to delete{" "}
            <span className="font-bold text-gray-900">
              Box #{box.boxNumber}
            </span>
            ?
          </p>
          <div className="rounded-xl border border-red-100 bg-red-50/60 p-3 text-xs text-gray-600 space-y-1">
            <p>
              <span className="font-semibold text-gray-700">Bay:</span>{" "}
              {box.bay}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Shelf:</span>{" "}
              {getShelfLetter(shelfLettersByBay, box.bay, box.shelf)}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Row / Level:</span>{" "}
              {box.row}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Certificate:</span>{" "}
              {box.certificateType}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Year:</span>{" "}
              {box.yearTo
                ? `${box.year} – ${box.yearTo}`
                : box.year}
            </p>
          </div>
          <div className="flex border-l-4 border-amber-500 bg-amber-50/60 rounded-r-xl py-3 pl-4 pr-3">
            <p className="text-xs text-amber-900/90">
              This action cannot be undone. The box record will be permanently
              removed.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-end pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-xl border-2 border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:from-red-700 hover:to-red-600 active:scale-[0.98] transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
