import React, { useMemo, useState } from "react";
import CertificateBadge from "./CertificateBadge.jsx";
import { LocationResultLayout } from "./LocationManagement.jsx";

const CERT_TYPES = [
  { code: "COLB", label: "Birth (COLB)" },
  { code: "COM", label: "Marriage (COM)" },
  { code: "COD", label: "Death (COD)" },
];

const YEARS = Array.from({ length: 87 }, (_, i) => 1944 + i); // 1944–2030
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

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

function computeLocation({ certificateType, year, monthIndex, registryNumber }) {
  if (!certificateType || !year || monthIndex == null || !registryNumber) {
    return null;
  }

  const numericRegistry = parseInt(registryNumber, 10);
  if (Number.isNaN(numericRegistry) || numericRegistry <= 0) {
    return null;
  }

  const certBayBase = {
    COLB: 1,
    COM: 3,
    COD: 5,
  }[certificateType];

  const bayOffset = ((year - 1990) % 2 + monthIndex) % 2;
  const bay = Math.min(6, certBayBase + bayOffset);

  // B-1 and B-6 have 2 shelves (S-A, S-B); B-2 through B-5 have 4 shelves (S-A, S-C, S-B, S-D) per test.html
  const shelfCount = bay === 1 || bay === 6 ? 2 : 4;
  const shelf = ((monthIndex % shelfCount) + 1);
  const row = ((numericRegistry - 1) % 6) + 1; // 1–6 (R-T=6, R-5=5, R-4=4, R-3=3, R-2=2, R-1=1)

  const baseBox = ((year - 1990) % 10) + 1;
  const box = ((baseBox + Math.floor((numericRegistry - 1) / 50)) % 20) + 1;

  const shelfLabel = SHELF_LETTERS_BY_BAY[bay]?.[shelf - 1] || `S-${shelf}`;
  const rowLabel = ROW_LABELS[row] || `R-${row}`;
  const searchCode = [
    certCodeForSearch(certificateType),
    `Y-${year}`,
    `B-${bay}`,
    shelfLabel,
    rowLabel,
    `B-${box}`,
  ].join(";");

  return {
    bay,
    shelf,
    row,
    box,
    searchCode,
  };
}

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
  const [monthIndex, setMonthIndex] = useState(null);
  const [registryNumber, setRegistryNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showAddBoxModal, setShowAddBoxModal] = useState(false);
  const isYearEnabled = !!certificateType;
  const isRegistryEnabled = isYearEnabled && !!year;
  const isMonthEnabled = isRegistryEnabled && !!registryNumber.trim();

  const matchingBox = useMemo(() => {
    if (!certificateType || !year || monthIndex == null || boxes.length === 0)
      return null;
    const yearNum = Number(year);
    return (
      boxes.find(
        (b) => {
          const yearInRange = b.yearTo != null
            ? yearNum >= b.year && yearNum <= b.yearTo
            : Number(b.year) === yearNum;
          return (
            b.certificateType === certificateType &&
            yearInRange &&
            (b.monthIndex === monthIndex ||
              (b.monthIndexTo != null &&
                monthIndex >= b.monthIndex &&
                monthIndex <= b.monthIndexTo))
          );
        }
      ) || null
    );
  }, [boxes, certificateType, year, monthIndex]);

  const handleSearch = (e) => {
    e.preventDefault();
    setTouched(true);
    setError("");

    if (!certificateType || !year || monthIndex == null || !registryNumber) {
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
        "No matching registered box found for the selected Type/Year/Month. Please add/register the box in Box Management first."
      );
      if (addLog) {
        addLog("search", {
          message: `Search (no match) for ${certificateType} - ${year} ${MONTHS[monthIndex]} #${registryNumber}`,
        });
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
        message: `Search for ${certificateType} - ${year} ${MONTHS[monthIndex]} #${registryNumber}`,
        searchCode: registeredResult.searchCode,
      });
    }
  };

  const handleReset = () => {
    setCertificateType("");
    setYear("");
    setMonthIndex(null);
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

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Document Locator
          </h2>
          <p className="text-sm text-gray-600">
            Locate physical boxes using certificate type, year, registry number, and month.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onAddBox && (
            <button
              type="button"
              onClick={() => setShowAddBoxModal(true)}
              className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition"
            >
              Add box
            </button>
          )}
          <CertificateBadge type={certificateType || undefined} />
        </div>
      </div>

      <form
        onSubmit={handleSearch}
        className="grid md:grid-cols-3 gap-3 border border-emerald-100 rounded-2xl p-4 md:p-5 bg-emerald-50/60"
      >
        <div className="space-y-1.5">
          <Label>Type of Certificate</Label>
          <select
            value={certificateType}
            onChange={(e) => {
              setCertificateType(e.target.value);
              setYear("");
              setMonthIndex(null);
              setRegistryNumber("");
              setResult(null);
            }}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select type</option>
            {CERT_TYPES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label disabled={!isYearEnabled}>Year</Label>
          <select
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setMonthIndex(null);
              setRegistryNumber("");
              setResult(null);
            }}
            disabled={!isYearEnabled}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label disabled={!isRegistryEnabled}>Registry Number</Label>
          <input
            type="text"
            inputMode="numeric"
            pattern="\d*"
            value={registryNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, "");
              setRegistryNumber(value);
              setMonthIndex(null);
              setResult(null);
            }}
            disabled={!isRegistryEnabled}
            placeholder="e.g., 1234"
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* <div className="space-y-1.5">
          <Label disabled={!isMonthEnabled}>Month</Label>
          <select
            value={monthIndex ?? ""}
            onChange={(e) => {
              const value = e.target.value === "" ? null : Number(e.target.value);
              setMonthIndex(value);
              setResult(null);
            }}
            disabled={!isMonthEnabled}
            className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select month</option>
            {MONTHS.map((m, index) => (
              <option key={m} value={index}>
                {m}
              </option>
            ))}
          </select>
        </div> */}

        <div className="md:col-span-4 flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Type → Year → Registry number.
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50"
            >
              Clear
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow shadow-emerald-500/30 hover:bg-emerald-700"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {touched && error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      {result && (
        <LocationResultLayout
          result={result}
          matchingBox={matchingBox}
          shelfLettersByBay={shelfLettersByBay}
          rowLabels={rowLabels}
        />
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
