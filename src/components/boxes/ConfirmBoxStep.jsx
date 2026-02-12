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
                <th className="px-4 py-2.5 font-semibold text-stone-500 uppercase tracking-wider w-36">
                  Field
                </th>
                <th className="px-4 py-2.5 font-semibold text-stone-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ label, value }) => (
                <tr
                  key={label}
                  className="border-b border-stone-100 last:border-b-0"
                >
                  <td className="px-4 py-2.5 text-stone-500 font-medium">
                    {label}
                  </td>
                  <td className="px-4 py-2.5 text-stone-900 font-medium">
                    {value}
                  </td>
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
