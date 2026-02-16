import React from "react";
import CertificateBadge from "../shared/CertificateBadge.jsx";
import { MONTHS } from "../../constants/index.js";
import { DEFAULT_SHELF_LETTERS_BY_BAY } from "../../constants/index.js";
import { getShelfLetter } from "../../utils/index.js";

export default function ConfirmBoxStep({
  payload,
  onBack,
  onConfirm,
  shelfLettersByBay,
}) {
  const yearLabel =
    payload.yearTo != null
      ? `${payload.year} – ${payload.yearTo}`
      : String(payload.year);
  const monthLabel =
    payload.monthIndexTo != null &&
    payload.monthIndexTo !== payload.monthIndex
      ? `${MONTHS[payload.monthIndex]} – ${MONTHS[payload.monthIndexTo]}`
      : MONTHS[payload.monthIndex];
  const rows = [
    {
      label: "Certificate type",
      value: <CertificateBadge type={payload.certificateType} compact />,
    },
    { label: "Year", value: yearLabel },
    { label: "Month", value: monthLabel },
    { label: "Box #", value: payload.boxNumber },
    { label: "Bay", value: payload.bay },
    {
      label: "Shelf",
      value: getShelfLetter(
        shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY,
        payload.bay,
        payload.shelf
      ),
    },
    { label: "Row / Level", value: payload.row },
    { label: "Registry range", value: payload.registryRange || "—" },
    { label: "Remark", value: payload.remark || "—" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4 pb-4 border-b-2 border-gray-200">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Confirm Box Details</h2>
          <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">Review all information before adding the box to the system</p>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50/50 border-l-4 border-blue-500 rounded-r-xl px-5 py-4 shadow-sm">
        <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-blue-900 font-semibold leading-relaxed">
            Please verify that all information matches the physical box label before confirming.
          </p>
        </div>
      </div>

      {/* Box Details Card */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-3">
          <h3 className="text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Box Information
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {rows.map(({ label, value }) => (
              <div
                key={label}
                className="flex flex-col space-y-1.5 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0"
              >
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                  {label}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t-2 border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 min-w-[140px]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Edit
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/40 hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 min-w-[180px]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          Confirm and Add Box
        </button>
      </div>
    </div>
  );
}
