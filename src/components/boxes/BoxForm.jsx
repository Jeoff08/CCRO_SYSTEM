import React, { useState, useEffect, useMemo } from "react";
import { Field } from "../ui/index.js";
import { CERT_TYPES, MONTHS, YEARS } from "../../constants/index.js";
import { DEFAULT_SHELF_LETTERS_BY_BAY, DEFAULT_ROW_LABELS } from "../../constants/index.js";
import { getShelfLetter, getShelfNumberFromLetter } from "../../utils/index.js";

export default function BoxForm({
  editingBox,
  prefillPayload,
  onSaved,
  onCancel,
  existingBoxes,
  shelfLettersByBay,
  rowLabels,
}) {
  const shelfMap = shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY;
  const rowLabelsMap = rowLabels || DEFAULT_ROW_LABELS;
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
  const [missingFields, setMissingFields] = useState([]);

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
    setMissingFields([]);
  }, [editingBox, prefillPayload, shelfMap, rowLabelsMap]);

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

  // Get available bays from shelfLettersByBay
  const availableBays = useMemo(
    () =>
      Object.keys(shelfMap)
        .map(Number)
        .filter((b) => !Number.isNaN(b))
        .sort((a, b) => a - b),
    [shelfMap]
  );

  // Get available rows from rowLabels
  const availableRows = useMemo(
    () =>
      Object.keys(rowLabelsMap)
        .map(Number)
        .filter((k) => !Number.isNaN(k))
        .sort((a, b) => a - b),
    [rowLabelsMap]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setMissingFields([]);

    // Check all required fields (excluding optional: yearTo, monthIndexTo, remark)
    const requiredFields = [];
    if (!certificateType) requiredFields.push("Certificate Type");
    if (!year) requiredFields.push("Year (From)");
    if (monthIndex == null) requiredFields.push("Month (From)");
    if (!boxNumber) requiredFields.push("Box Number");
    if (!bay) requiredFields.push("Bay");
    if (!shelfLetter) requiredFields.push("Shelf");
    if (!row) requiredFields.push("Row / Level");
    if (!registryRange || !registryRange.trim()) requiredFields.push("Registry Number Range");

    if (requiredFields.length > 0) {
      setMissingFields(requiredFields);
      setError("Please fill out all required fields.");
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

    if (!availableBays.includes(bayNum) || shelfNum == null || !availableRows.includes(rowNum)) {
      setError("Bay, shelf, and Row/Level must match the configured location layout.");
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
      className="space-y-8"
      noValidate
    >
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={editingBox ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M12 4v16m8-8H4"} />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              {editingBox ? "Edit Box" : "Add New Box"}
            </h2>
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
              {editingBox ? "Update box information and location details" : "Register a new box in the archive system with complete location and certificate information"}
            </p>
          </div>
        </div>
        
        {/* Information Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border-l-4 border-blue-500 rounded-r-xl px-5 py-4 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-900 font-medium leading-relaxed">
                <span className="font-bold">Required fields:</span> Certificate type, Year (From), Month (From), Box number, Bay, Shelf, Row/Level, Registry number range.
              </p>
              <p className="text-xs text-blue-800 mt-2 leading-relaxed">
                You can select date ranges (e.g., January to February, 2025 to 2026). Year To, Month To, and Remark are optional.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Certificate & Time Period Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Certificate & Time Period</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="Certificate Type">
          <select
            value={certificateType}
            onChange={(e) => {
              setCertificateType(e.target.value);
              if (e.target.value && missingFields.includes("Certificate Type")) {
                setMissingFields(prev => prev.filter(f => f !== "Certificate Type"));
              }
            }}
            aria-invalid={missingFields.includes("Certificate Type")}
            aria-describedby={missingFields.includes("Certificate Type") ? "cert-type-error" : undefined}
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${
              missingFields.includes("Certificate Type")
                ? "border-amber-400 bg-amber-50 focus:ring-amber-400 focus:border-amber-500"
                : "border-gray-200 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300"
            }`}
          >
            <option value="">Select certificate type</option>
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
            onChange={(e) => {
              setYear(e.target.value);
              if (e.target.value && missingFields.includes("Year (From)")) {
                setMissingFields(prev => prev.filter(f => f !== "Year (From)"));
              }
            }}
            aria-invalid={missingFields.includes("Year (From)")}
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${
              missingFields.includes("Year (From)")
                ? "border-amber-400 bg-amber-50 focus:ring-amber-400 focus:border-amber-500"
                : "border-gray-200 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300"
            }`}
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
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
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
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              setMonthIndex(val);
              if (val != null && missingFields.includes("Month (From)")) {
                setMissingFields(prev => prev.filter(f => f !== "Month (From)"));
              }
            }}
            aria-invalid={missingFields.includes("Month (From)")}
            className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${
              missingFields.includes("Month (From)")
                ? "border-amber-400 bg-amber-50 focus:ring-amber-400 focus:border-amber-500"
                : "border-gray-200 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300"
            }`}
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
            className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
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


        </div>
      </div>

      {/* Location Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Physical Location</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="Bay">
            <select
              value={bay}
              onChange={(e) => {
                setBay(e.target.value);
                if (e.target.value && missingFields.includes("Bay")) {
                  setMissingFields(prev => prev.filter(f => f !== "Bay"));
                }
              }}
              aria-invalid={missingFields.includes("Bay")}
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                missingFields.includes("Bay")
                  ? "border-amber-400 bg-amber-50 focus:ring-amber-400 focus:border-amber-500"
                  : "border-gray-200 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300"
              }`}
            >
              <option value="">Select bay</option>
              {availableBays.map((b) => (
                <option key={b} value={b}>
                  B-{b}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Shelf (letters)">
            <select
              value={shelfLetter}
              onChange={(e) => {
                setShelfLetter(e.target.value);
                if (e.target.value && missingFields.includes("Shelf")) {
                  setMissingFields(prev => prev.filter(f => f !== "Shelf"));
                }
              }}
              disabled={!bay}
              aria-invalid={missingFields.includes("Shelf")}
              aria-describedby={!bay ? "shelf-disabled-hint" : undefined}
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                missingFields.includes("Shelf")
                  ? "border-amber-400 bg-amber-50 focus:ring-amber-400 focus:border-amber-500"
                  : "border-gray-200 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300"
              } disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200`}
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
            {!bay && (
              <p id="shelf-disabled-hint" className="text-xs text-gray-500 mt-1">
                Please select a bay first
              </p>
            )}
          </Field>

          <Field label="Row / Level">
            <select
              value={row}
              onChange={(e) => {
                setRow(e.target.value);
                if (e.target.value && missingFields.includes("Row / Level")) {
                  setMissingFields(prev => prev.filter(f => f !== "Row / Level"));
                }
              }}
              aria-invalid={missingFields.includes("Row / Level")}
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                missingFields.includes("Row / Level")
                  ? "border-amber-400 bg-amber-50 focus:ring-amber-400 focus:border-amber-500"
                  : "border-gray-200 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300"
              }`}
            >
              <option value="">Select row / level</option>
              {availableRows.map((r) => (
                <option key={r} value={r}>
                  {rowLabelsMap[r] || `R-${r}`}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      {/* Box Details Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Box Details</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field label="Box Number">
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              value={boxNumber}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, "");
                setBoxNumber(val);
                if (val && missingFields.includes("Box Number")) {
                  setMissingFields(prev => prev.filter(f => f !== "Box Number"));
                }
              }}
              aria-invalid={missingFields.includes("Box Number")}
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                missingFields.includes("Box Number")
                  ? "border-amber-400 bg-amber-50 focus:ring-amber-400 focus:border-amber-500"
                  : "border-gray-200 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300"
              }`}
              placeholder="e.g., 3"
            />
          </Field>

          <Field label="Registry Number Range *">
            <input
              type="text"
              value={registryRange}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d-]/g, "");
                const parts = val.split("-");
                const sanitized =
                  parts.length > 2 ? parts[0] + "-" + parts.slice(1).join("") : val;
                setRegistryRange(sanitized);
                // Clear missing fields when user starts typing
                if (sanitized.trim() && missingFields.includes("Registry Number Range")) {
                  setMissingFields(prev => prev.filter(f => f !== "Registry Number Range"));
                }
              }}
              aria-invalid={missingFields.includes("Registry Number Range")}
              className={`w-full rounded-xl border-2 px-4 py-3 text-sm font-medium text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                missingFields.includes("Registry Number Range")
                  ? "border-amber-400 bg-amber-50 focus:ring-amber-400 focus:border-amber-500"
                  : "border-gray-200 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300"
              }`}
              placeholder="e.g., 1-100"
            />
          </Field>

          <Field label="Remark">
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-500 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              placeholder="e.g., notes or comments"
            />
          </Field>
        </div>
      </div>

      {/* Error Messages */}
      {(error || missingFields.length > 0) && (
        <div className="space-y-3 pt-2" role="alert" aria-live="polite">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border-l-4 border-red-500 rounded-r-xl px-5 py-4 shadow-sm">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-900 font-semibold leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {missingFields.length > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl px-5 py-4 shadow-sm">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-900 mb-1.5">Missing required fields:</p>
                <p className="text-sm text-amber-800 leading-relaxed">{missingFields.join(", ")}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t-2 border-gray-200">
        <div className="flex items-start gap-2 text-xs text-gray-600">
          <svg className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <p className="leading-relaxed">
            Duplicate box numbers are automatically prevented within the same location.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 sm:flex-nowrap">
          {editingBox && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md active:scale-95 transition-all duration-200 min-w-[100px]"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/40 hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 min-w-[120px]"
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
                d={
                  editingBox ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"
                }
              />
            </svg>
            {editingBox ? "Update Box" : "Add Box"}
          </button>
        </div>
      </div>
    </form>
  );
}
