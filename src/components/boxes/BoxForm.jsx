import React, { useState, useEffect, useMemo } from "react";
import { Field } from "../ui/index.js";
import { CERT_TYPES, MONTHS, YEARS } from "../../constants/index.js";
import { DEFAULT_SHELF_LETTERS_BY_BAY } from "../../constants/index.js";
import { getShelfLetter, getShelfNumberFromLetter } from "../../utils/index.js";

export default function BoxForm({
  editingBox,
  prefillPayload,
  onSaved,
  onCancel,
  existingBoxes,
  shelfLettersByBay,
}) {
  const shelfMap = shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY;
  const source = editingBox || prefillPayload || {};

  const [certificateType, setCertificateType] = useState(source.certificateType || "");
  const [year, setYear] = useState(source.year != null ? String(source.year) : "");
  const [yearTo, setYearTo] = useState(source.yearTo != null ? String(source.yearTo) : "");
  const [monthIndex, setMonthIndex] = useState(source.monthIndex ?? null);
  const [monthIndexTo, setMonthIndexTo] = useState(source.monthIndexTo ?? null);
  const [boxNumber, setBoxNumber] = useState(source.boxNumber != null ? String(source.boxNumber) : "");
  const [bay, setBay] = useState(source.bay != null ? String(source.bay) : "");

  const initialShelfLetter =
    source.shelf != null && source.bay != null
      ? getShelfLetter(shelfMap, source.bay, source.shelf)
      : "";
  const [shelfLetter, setShelfLetter] = useState(initialShelfLetter);
  const [row, setRow] = useState(source.row != null ? String(source.row) : "");
  const [registryRange, setRegistryRange] = useState(source.registryRange || "");
  const [remark, setRemark] = useState(source.remark || "");
  const [error, setError] = useState("");

  // Sync form fields when editingBox or prefillPayload changes
  useEffect(() => {
    const src = editingBox || prefillPayload;
    if (!src) return;
    setCertificateType(src.certificateType || "");
    setYear(src.year != null ? String(src.year) : "");
    setYearTo(src.yearTo != null ? String(src.yearTo) : "");
    setMonthIndex(src.monthIndex ?? null);
    setMonthIndexTo(src.monthIndexTo ?? null);
    setBoxNumber(src.boxNumber != null ? String(src.boxNumber) : "");
    setBay(src.bay != null ? String(src.bay) : "");
    const sl =
      src.shelf != null && src.bay != null
        ? getShelfLetter(shelfMap, src.bay, src.shelf)
        : "";
    setShelfLetter(sl);
    setRow(src.row != null ? String(src.row) : "");
    setRegistryRange(src.registryRange || "");
    setRemark(src.remark || "");
    setError("");
  }, [editingBox, prefillPayload, shelfMap]);

  // Reset shelf when bay changes
  useEffect(() => {
    if (!bay) {
      setShelfLetter("");
      return;
    }
    const bayNum = Number(bay);
    const allowed = shelfMap[bayNum];
    if (!allowed || (shelfLetter && !allowed.includes(shelfLetter))) {
      setShelfLetter("");
    }
  }, [bay, shelfLetter, shelfMap]);

  const bayNumForShelves = Number(bay);
  const availableShelves = useMemo(
    () =>
      Number.isNaN(bayNumForShelves) || !bay
        ? []
        : shelfMap[bayNumForShelves] || [],
    [bay, bayNumForShelves, shelfMap]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!certificateType || !year || monthIndex == null || !boxNumber || !bay || !shelfLetter || !row) {
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

    if (!/^\d+$/.test(String(boxNumber))) {
      setError("Box number must be numeric.");
      return;
    }

    const bayNum = Number(bay);
    const rowNum = Number(row);
    const shelfNum = getShelfNumberFromLetter(shelfMap, bayNum, shelfLetter);

    if (bayNum < 1 || bayNum > 6 || shelfNum == null || rowNum < 1 || rowNum > 6) {
      setError("Bay must be 1–6, shelf must match the bay's letters, and Row/Level 1–6 to match physical layout.");
      return;
    }

    // Validate registry range format
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

    // Duplicate check
    const duplicate = existingBoxes.find(
      (b) =>
        b.id !== editingBox?.id &&
        b.bay === bayNum &&
        b.shelf === shelfNum &&
        b.row === rowNum &&
        b.boxNumber === Number(boxNumber)
    );

    if (duplicate) {
      setError("A box with the same number already exists on this bay, shelf, and row/level.");
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
            Required: type, year, Month From, box number, bay, shelf, row. You
            can select one or a range: e.g. January to February, 2025 to 2026.
            Year To and Month To are optional.
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
            <option value="">
              Same as From or leave empty (e.g. 2025 to 2026)
            </option>
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
              setMonthIndex(e.target.value === "" ? null : Number(e.target.value))
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
              setMonthIndexTo(e.target.value === "" ? null : Number(e.target.value))
            }
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">
              Same or after From (e.g. January to February)
            </option>
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
            onChange={(e) => setBoxNumber(e.target.value.replace(/[^\d]/g, ""))}
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
            <option value="">
              {bay ? "Select shelf letter" : "Select bay first"}
            </option>
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
              const val = e.target.value.replace(/[^\d-]/g, "");
              const parts = val.split("-");
              const sanitized =
                parts.length > 2 ? parts[0] + "-" + parts.slice(1).join("") : val;
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
                d={
                  editingBox ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"
                }
              />
            </svg>
            {editingBox ? "Update" : "Add box"}
          </button>
        </div>
      </div>
    </form>
  );
}
