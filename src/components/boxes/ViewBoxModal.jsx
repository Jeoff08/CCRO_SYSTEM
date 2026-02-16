import React from "react";
import CertificateBadge from "../shared/CertificateBadge.jsx";
import { MONTHS } from "../../constants/index.js";
import { DEFAULT_SHELF_LETTERS_BY_BAY, DEFAULT_ROW_LABELS } from "../../constants/index.js";
import { getShelfLetter } from "../../utils/index.js";

export default function ViewBoxModal({
  box,
  shelfLettersByBay,
  rowLabels,
  onClose,
}) {
  if (!box) return null;

  const shelfMap = shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY;
  const rowLabelsMap = rowLabels || DEFAULT_ROW_LABELS;

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const raw =
        typeof dateString === "string" && !dateString.endsWith("Z") && !dateString.includes("+")
          ? dateString + "Z"
          : dateString;
      const date = new Date(raw);
      if (Number.isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString("en-PH", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const yearLabel =
    box.yearTo != null
      ? `${box.year} – ${box.yearTo}`
      : String(box.year);

  const monthLabel =
    box.monthIndexTo != null && box.monthIndexTo !== box.monthIndex
      ? `${MONTHS[box.monthIndex]} – ${MONTHS[box.monthIndexTo]}`
      : box.monthIndex != null
      ? MONTHS[box.monthIndex]
      : "—";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-box-modal-title"
    >
      <div
        className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Simplified */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <h3
              id="view-box-modal-title"
              className="text-lg font-bold text-gray-900"
            >
              Box Information
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-all"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6">
            {/* Hero Section - Box Number & Location Combined */}
            <div className="bg-gradient-to-br from-emerald-50 via-sky-50 to-emerald-50 rounded-2xl p-6 border-2 border-emerald-200/60 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* Box Number - Ultra Prominent */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-md">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                      Box Number
                    </p>
                  </div>
                  <p className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                    {box.boxNumber != null && box.boxNumber !== "" ? box.boxNumber : "—"}
                  </p>
                </div>

                {/* Location - Unified Display */}
                <div className="flex-shrink-0">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/50 shadow-sm">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Physical Location
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Bay
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          B-{box.bay}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Shelf
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {getShelfLetter(shelfMap, box.bay, box.shelf)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                          Row
                        </p>
                        <p className="text-xl font-bold text-gray-900">
                          {rowLabelsMap[box.row] || `R-${box.row}`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Certificate & Date Information */}
              <div className="lg:col-span-2 space-y-4">
                {/* Certificate Type & Date Range */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Certificate Details
                  </h4>
                  <div className="space-y-4">
                    {/* Certificate Type */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Certificate Type
                      </p>
                      <div>
                        {box.certificateType ? (
                          <CertificateBadge type={box.certificateType} />
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </div>
                    </div>

                    {/* Year & Month - Side by Side */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Year
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {yearLabel}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                          Month
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {monthLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information - Only if exists */}
                {(box.registryRange || box.remark) && (
                  <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-emerald-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112 112L11.5 11.5l-2 2-1.414 1.414L8 16.414l1.414-1.414 2-2 4.586-4.586z"
                        />
                      </svg>
                      Additional Notes
                    </h4>
                    <div className="space-y-3">
                      {box.registryRange && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Registry Number Range
                          </p>
                          <p className="text-sm text-gray-900 font-medium bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            {box.registryRange}
                          </p>
                        </div>
                      )}
                      {box.remark && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Remark
                          </p>
                          <p className="text-sm text-gray-900 font-medium bg-gray-50 rounded-lg px-3 py-2 border border-gray-200">
                            {box.remark}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata Sidebar */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Metadata
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                        Created
                      </p>
                      <p className="text-xs text-gray-700 font-medium">
                        {formatDate(box.createdAt)}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
                        Last Updated
                      </p>
                      <p className="text-xs text-gray-700 font-medium">
                        {formatDate(box.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

