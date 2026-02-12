import React, { useMemo, useState } from "react";
import CertificateBadge from "../shared/CertificateBadge.jsx";
import LocationResultLayout from "../locations/LocationResultLayout.jsx";
import LocationRack3D from "../locations/LocationRack3D.jsx";
import { Label } from "../ui/index.js";
import YearCombobox from "./YearCombobox.jsx";
import { CERT_TYPES, MONTHS } from "../../constants/index.js";
import { DEFAULT_ROW_LABELS, DEFAULT_SHELF_LETTERS_BY_BAY } from "../../constants/index.js";
import { buildSearchCode, parseRegistryRange } from "../../utils/index.js";

export default function DocumentLocator({
  boxes,
  addLog,
  shelfLettersByBay = DEFAULT_SHELF_LETTERS_BY_BAY,
  rowLabels = DEFAULT_ROW_LABELS,
}) {
  const [certificateType, setCertificateType] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [registryNumber, setRegistryNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [show3DPreview, setShow3DPreview] = useState(false);

  /* ── Derived filters ── */
  const boxesForType = useMemo(() => {
    if (!certificateType || boxes.length === 0) return [];
    return boxes.filter((b) => b.certificateType === certificateType);
  }, [boxes, certificateType]);

  const availableYears = useMemo(() => {
    if (boxesForType.length === 0) return [];
    const yearSet = new Set();
    boxesForType.forEach((b) => {
      const from = Number(b.year);
      const to = b.yearTo != null ? Number(b.yearTo) : from;
      for (let y = from; y <= to; y++) yearSet.add(y);
    });
    return [...yearSet].sort((a, b) => a - b);
  }, [boxesForType]);

  const boxesForTypeAndYear = useMemo(() => {
    if (!year || boxesForType.length === 0) return [];
    const yearNum = Number(year);
    return boxesForType.filter((b) => {
      const to = b.yearTo != null ? Number(b.yearTo) : Number(b.year);
      return yearNum >= Number(b.year) && yearNum <= to;
    });
  }, [boxesForType, year]);

  const availableMonths = useMemo(() => {
    if (boxesForTypeAndYear.length === 0) return [];
    const monthSet = new Set();
    boxesForTypeAndYear.forEach((b) => {
      const from = b.monthIndex;
      const to = b.monthIndexTo != null ? b.monthIndexTo : from;
      for (let m = from; m <= to; m++) monthSet.add(m);
    });
    return [...monthSet].sort((a, b) => a - b);
  }, [boxesForTypeAndYear]);

  const isYearEnabled = !!certificateType && availableYears.length > 0;
  const isMonthEnabled = isYearEnabled && !!year && availableMonths.length > 0;
  const isRegistryEnabled = isMonthEnabled && month !== "";

  const matchingBoxes = useMemo(() => {
    if (!certificateType || !year || month === "" || boxes.length === 0) return [];
    const yearNum = Number(year);
    const monthNum = Number(month);
    return boxes.filter((b) => {
      const yearInRange = b.yearTo != null ? yearNum >= b.year && yearNum <= b.yearTo : Number(b.year) === yearNum;
      const monthInRange = b.monthIndexTo != null ? monthNum >= b.monthIndex && monthNum <= b.monthIndexTo : b.monthIndex === monthNum;
      return b.certificateType === certificateType && yearInRange && monthInRange;
    });
  }, [boxes, certificateType, year, month]);

  const availableRegistryRanges = useMemo(() => matchingBoxes.filter((b) => b.registryRange).map((b) => b.registryRange), [matchingBoxes]);

  const matchingBox = useMemo(() => {
    if (matchingBoxes.length === 0) return null;
    if (!registryNumber) return matchingBoxes[0];
    const regNum = Number(registryNumber);
    const rangeMatch = matchingBoxes.find((b) => { const r = parseRegistryRange(b.registryRange); return r && regNum >= r.start && regNum <= r.end; });
    return rangeMatch || matchingBoxes[0];
  }, [matchingBoxes, registryNumber]);

  /* ── Search handler ── */
  const handleSearch = (e) => {
    e.preventDefault();
    setTouched(true);
    setError("");

    if (!certificateType || !year || month === "" || !registryNumber) { setError("Please complete all search fields in order."); return; }
    if (!/^\d{1,6}$/.test(registryNumber)) { setError("Registry number must be numeric (up to 6 digits)."); return; }

    if (matchingBoxes.length === 0) {
      setResult(null);
      setError("No matching registered box found for the selected Type/Year/Month. Please add/register the box in Box Management first.");
      if (addLog) addLog("search", { message: `Search (no match) for ${certificateType} - ${MONTHS[Number(month)]} ${year} #${registryNumber}` }, null);
      return;
    }

    const regNum = Number(registryNumber);
    const rangeMatch = matchingBoxes.find((b) => { const r = parseRegistryRange(b.registryRange); return r && regNum >= r.start && regNum <= r.end; });

    if (!rangeMatch) {
      const hasAnyRange = matchingBoxes.some((b) => b.registryRange);
      setResult(null);
      setError(hasAnyRange ? `Registry number ${registryNumber} does not fall within any registered box's range for ${certificateType} - ${MONTHS[Number(month)]} ${year}.` : "Matching boxes found but none have a registry range defined. Please update the box in Box Management.");
      if (addLog) addLog("search", { message: `Search (no registry range match) for ${certificateType} - ${MONTHS[Number(month)]} ${year} #${registryNumber}` }, null);
      return;
    }

    const searchCode = buildSearchCode({ certificateType, year: Number(year), bay: rangeMatch.bay, shelf: rangeMatch.shelf, row: rangeMatch.row, boxNumber: rangeMatch.boxNumber, shelfLettersByBay, rowLabels });
    const registeredResult = { bay: rangeMatch.bay, shelf: rangeMatch.shelf, row: rangeMatch.row, box: rangeMatch.boxNumber, searchCode };
    setResult(registeredResult);
    if (addLog) addLog("search", { message: `Search for ${certificateType} - ${MONTHS[Number(month)]} ${year} #${registryNumber}`, searchCode }, searchCode);
  };

  const handleReset = () => { setCertificateType(""); setYear(""); setMonth(""); setRegistryNumber(""); setTouched(false); setResult(null); setError(""); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Document Locator</h2>
          <p className="text-sm text-gray-600 leading-relaxed">Locate physical boxes using certificate type, year, month, and registry number.</p>
        </div>
        <CertificateBadge type={certificateType || undefined} />
      </div>

      {/* Search form */}
      <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-5 rounded-3xl p-6 md:p-7 bg-gradient-to-br from-emerald-50/80 via-sky-50/40 to-emerald-50/60 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
        <div className="space-y-2">
          <Label>Type of Certificate</Label>
          <select value={certificateType} onChange={(e) => { setCertificateType(e.target.value); setYear(""); setMonth(""); setRegistryNumber(""); setResult(null); }} className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 shadow-sm hover:shadow-md">
            <option value="">Select type</option>
            {CERT_TYPES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
          </select>
        </div>

        <YearCombobox year={year} setYear={(val) => { setYear(val); setMonth(""); setRegistryNumber(""); setResult(null); }} availableYears={availableYears} disabled={!isYearEnabled} placeholder={certificateType && availableYears.length === 0 ? "No years registered" : "Type or select year"} />

        <div className="space-y-2">
          <Label disabled={!isMonthEnabled}>Month</Label>
          <select value={month} onChange={(e) => { setMonth(e.target.value); setRegistryNumber(""); setResult(null); }} disabled={!isMonthEnabled} className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 disabled:bg-gray-50/80 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 shadow-sm hover:shadow-md">
            <option value="">{year && availableMonths.length === 0 ? "No months registered for this year" : "Select month"}</option>
            {availableMonths.map((idx) => <option key={idx} value={idx}>{MONTHS[idx]}</option>)}
          </select>
        </div>

        <div className="space-y-2">
          <Label disabled={!isRegistryEnabled}>Registry Number</Label>
          <input type="text" inputMode="numeric" pattern="\d*" value={registryNumber} onChange={(e) => { setRegistryNumber(e.target.value.replace(/[^\d]/g, "")); setResult(null); }} disabled={!isRegistryEnabled} placeholder={availableRegistryRanges.length > 0 ? `Ranges: ${availableRegistryRanges.join(", ")}` : "e.g., 1234"} className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 disabled:bg-gray-50/80 disabled:text-gray-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 shadow-sm hover:shadow-md" />
          {isRegistryEnabled && availableRegistryRanges.length > 0 && (
            <p className="text-[10px] text-emerald-600 mt-1 px-1">Available: {availableRegistryRanges.join(", ")}</p>
          )}
        </div>

        <div className="md:col-span-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t-2 border-emerald-200/50 mt-2">
          <div className="flex items-center gap-2 text-[11px] text-gray-600 bg-white/70 rounded-full px-3 py-1.5 border border-emerald-200/50 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            Type → Year → Month → Registry number (options are based on registered boxes).
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={handleReset} className="inline-flex items-center justify-center gap-2 rounded-xl border-0 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:shadow-md active:scale-95 transition-all duration-200 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
              Clear
            </button>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/40 hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Search
            </button>
          </div>
        </div>
      </form>

      {/* 3D Rack Preview toggle */}
      <div className="border-2 border-emerald-200/60 rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 p-5 md:p-6 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
            <h3 className="text-sm font-bold text-gray-900">3D Rack Preview</h3>
            {result && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 rounded-full px-2 py-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Location highlighted
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShow3DPreview((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-xl transition-all duration-200 border border-emerald-200 bg-white text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
            </svg>
            {show3DPreview ? "Hide 3D" : "Show 3D"}
          </button>
        </div>
        {show3DPreview && (
          <div className="mt-4">
            <LocationRack3D
              shelfLettersByBay={shelfLettersByBay}
              rowLabels={rowLabels}
              highlight={result && matchingBox ? { bay: matchingBox.bay, shelf: matchingBox.shelf, row: matchingBox.row, box: matchingBox.boxNumber } : null}
            />
          </div>
        )}
      </div>

      {touched && error && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
          <p className="text-xs text-red-700 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 shadow-md">{error}</p>
        </div>
      )}

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <LocationResultLayout
            result={result}
            matchingBox={matchingBox}
            shelfLettersByBay={shelfLettersByBay}
            rowLabels={rowLabels}
            accent={certificateType === "COLB" ? "blue" : certificateType === "COM" ? "rose" : certificateType === "COD" ? "violet" : "emerald"}
          />
        </div>
      )}
    </div>
  );
}
