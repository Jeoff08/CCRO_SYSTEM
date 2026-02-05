import React, { useMemo, useState } from "react";
import CertificateBadge from "./CertificateBadge.jsx";
import { LocationResultLayout } from "./LocationManagement.jsx";

const CERT_TYPES = [
  { code: "COLB", label: "Birth (COLB)" },
  { code: "COM", label: "Marriage (COM)" },
  { code: "COD", label: "Death (COD)" },
];

const YEARS = Array.from({ length: 87 }, (_, i) => 1944 + i); // 1944–2030

// Defaults (used when no Location Management profile is provided)
const DEFAULT_ROW_LABELS = { 1: "R-1", 2: "R-2", 3: "R-3", 4: "R-4", 5: "R-5", 6: "R-T" };
const DEFAULT_SHELF_LETTERS_BY_BAY = {
  1: ["S-A", "S-B"],
  2: ["S-A", "S-C", "S-B", "S-D"],
  3: ["S-A", "S-C", "S-B", "S-D"],
  4: ["S-A", "S-C", "S-B", "S-D"],
  5: ["S-A", "S-C", "S-B", "S-D"],
  6: ["S-A", "S-B"],
};

function certCodeForSearch(type) {
  switch (type) {
    case "COLB":
      return "COB";
    case "COM":
      return "COM";
    case "COD":
      return "COD";
    default:
      return type;
  }
}

function buildSearchCodeFromRegisteredBox({
  certificateType,
  year,
  bay,
  shelf,
  row,
  boxNumber,
  shelfLettersByBay,
  rowLabels,
}) {
  const shelfLabel = shelfLettersByBay[bay]?.[shelf - 1] || `S-${shelf}`;
  const rowLabel = rowLabels[row] || `R-${row}`;
  return [
    certCodeForSearch(certificateType),
    `Y-${year}`,
    `B-${bay}`,
    shelfLabel,
    rowLabel,
    `B-${boxNumber}`,
  ].join(";");
}

export default function DocumentLocator({
  boxes,
  addLog,
  onAddBox,
  shelfLettersByBay = DEFAULT_SHELF_LETTERS_BY_BAY,
  rowLabels = DEFAULT_ROW_LABELS,
}) {
  const [certificateType, setCertificateType] = useState("");
  const [year, setYear] = useState("");
  const [registryNumber, setRegistryNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showAddBoxModal, setShowAddBoxModal] = useState(false);
  const isYearEnabled = !!certificateType;
  const isRegistryEnabled = isYearEnabled && !!year;

  const matchingBox = useMemo(() => {
    if (!certificateType || !year || boxes.length === 0) return null;
    const yearNum = Number(year);
    return (
      boxes.find(
        (b) => {
          const yearInRange = b.yearTo != null
            ? yearNum >= b.year && yearNum <= b.yearTo
            : Number(b.year) === yearNum;
          return (
            b.certificateType === certificateType &&
            yearInRange
          );
        }
      ) || null
    );
  }, [boxes, certificateType, year]);

  const handleSearch = (e) => {
    e.preventDefault();
    setTouched(true);
    setError("");

    if (!certificateType || !year || !registryNumber) {
      setError("Please complete all search fields in order.");
      return;
    }

    if (!/^\d{1,6}$/.test(registryNumber)) {
      setError("Registry number must be numeric (up to 6 digits).");
      return;
    }

    // Make locator dependent on Box Management: only show results when a matching box exists.
    if (!matchingBox) {
      setResult(null);
      setError(
        "No matching registered box found for the selected Type/Year. Please add/register the box in Box Management first."
      );
      if (addLog) {
        addLog("search", {
          message: `Search (no match) for ${certificateType} - ${year} #${registryNumber}`,
        }, null);
      }
      return;
    }

    const yearNum = Number(year);
    const registeredResult = {
      bay: matchingBox.bay,
      shelf: matchingBox.shelf,
      row: matchingBox.row,
      box: matchingBox.boxNumber,
      searchCode: buildSearchCodeFromRegisteredBox({
        certificateType,
        year: yearNum,
        bay: matchingBox.bay,
        shelf: matchingBox.shelf,
        row: matchingBox.row,
        boxNumber: matchingBox.boxNumber,
        shelfLettersByBay,
        rowLabels,
      }),
    };

    setResult(registeredResult);

    if (addLog) {
      addLog("search", {
        message: `Search for ${certificateType} - ${year} #${registryNumber}`,
        searchCode: registeredResult.searchCode,
      }, registeredResult.searchCode);
    }
  };

  const handleReset = () => {
    setCertificateType("");
    setYear("");
    setRegistryNumber("");
    setTouched(false);
    setResult(null);
    setError("");
  };

  const handleAddBoxFromModal = (payload) => {
    if (onAddBox) onAddBox(payload);
    if (addLog) {
      addLog(
        "box-add",
        `Box ${payload.boxNumber} created (Bay ${payload.bay}, Shelf ${payload.shelf}, Row ${payload.row}).`
      );
    }
    setShowAddBoxModal(false);
  };

  return (
    <div className="space-y-6">
      {showAddBoxModal && onAddBox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setShowAddBoxModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-box-modal-title"
        >
          <div
            className="bg-white rounded-2xl border border-emerald-100 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-emerald-100 flex items-center justify-between">
              <h3 id="add-box-modal-title" className="text-sm font-semibold text-gray-900">
                Add New Box
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBoxModal(false)}
                className="rounded-full p-1.5 text-gray-500 hover:bg-emerald-50 hover:text-gray-700"
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <span aria-hidden>×</span>
              </button>
            </div>
            <div className="p-4">
              <BoxForm
                editingBox={null}
                onSaved={handleAddBoxFromModal}
                onCancel={() => setShowAddBoxModal(false)}
                existingBoxes={boxes}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Document Locator
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Locate physical boxes using certificate type, year, and registry number.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onAddBox && (
            <button
              type="button"
              onClick={() => setShowAddBoxModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-400 bg-white px-4 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add box
            </button>
          )}
          <CertificateBadge type={certificateType || undefined} />
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="grid md:grid-cols-3 gap-5 border-2 border-emerald-200/60 rounded-3xl p-6 md:p-7 bg-gradient-to-br from-emerald-50/80 via-sky-50/40 to-emerald-50/60 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300"
      >
        <div className="space-y-2">
          <Label>Type of Certificate</Label>
          <select
            value={certificateType}
            onChange={(e) => {
              setCertificateType(e.target.value);
              setYear("");
              setRegistryNumber("");
              setResult(null);
            }}
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select type</option>
            {CERT_TYPES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label disabled={!isYearEnabled}>Year</Label>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setRegistryNumber("");
              setResult(null);
            }}
            disabled={!isYearEnabled}
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm font-medium text-gray-900 disabled:bg-gray-50/80 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <option value="">Select year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label disabled={!isRegistryEnabled}>Registry Number</Label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={registryNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, "");
              setRegistryNumber(value);
              setResult(null);
            }}
            disabled={!isRegistryEnabled}
            placeholder="e.g., 1234"
            className="w-full rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-3 text-sm font-medium text-gray-900 disabled:bg-gray-50/80 disabled:text-gray-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 hover:border-emerald-300 transition-all duration-200 shadow-sm hover:shadow-md"
          />
        </div>

        <div className="md:col-span-3 flex flex-wrap items-center justify-between gap-4 pt-3 border-t-2 border-emerald-200/50 mt-2">
          <div className="flex items-center gap-2 text-[11px] text-gray-600 bg-white/70 rounded-full px-3 py-1.5 border border-emerald-200/50 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            Type → Year → Registry number (each unlocks the next).
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-emerald-200/60 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-md active:scale-95 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-500/40 hover:from-emerald-700 hover:to-sky-700 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </div>
      </form>

      {touched && error && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
          <p className="text-xs text-red-700 bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 shadow-md">
            {error}
          </p>
        </div>
      )}

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <LocationResultLayout
            result={result}
            matchingBox={matchingBox}
            shelfLettersByBay={shelfLettersByBay}
            rowLabels={rowLabels}
            accent={
              certificateType === "COLB"
                ? "blue"
                : certificateType === "COM"
                ? "rose"
                : certificateType === "COD"
                ? "violet"
                : "emerald"
            }
          />
        </div>
      )}
    </div>
  );
}

function Label({ children, disabled }) {
  return (
    <label
      className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${
        disabled ? "text-gray-400" : "text-gray-700"
      }`}
    >
      {children}
    </label>
  );
}
