import React, { useMemo, useState } from "react";
import CertificateBadge from "./CertificateBadge.jsx";

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

export default function BoxManagement({ boxes, onAdd, onUpdate, addLog }) {
  const [editingBox, setEditingBox] = useState(null);
  const [showAddBoxModal, setShowAddBoxModal] = useState(false);
  const [modalStep, setModalStep] = useState("form"); // 'form' | 'confirm' | 'success'
  const [pendingBoxPayload, setPendingBoxPayload] = useState(null);

  const handleSave = (payload) => {
    if (editingBox) {
      onUpdate(payload);
      if (addLog) {
        addLog(
          "box-edit",
          `Box ${payload.boxNumber} updated (Bay ${payload.bay}, Shelf ${payload.shelf}, Row ${payload.row}).`
        );
      }
      setShowAddBoxModal(false);
    } else {
      setPendingBoxPayload(payload);
      setModalStep("confirm");
    }
  };

  const handleConfirmAdd = () => {
    if (!pendingBoxPayload) return;
    const payload = { ...pendingBoxPayload, id: pendingBoxPayload.id || crypto.randomUUID() };
    onAdd(payload);
    if (addLog) {
      addLog(
        "box-add",
        `Box ${payload.boxNumber} created (Bay ${payload.bay}, Shelf ${payload.shelf}, Row ${payload.row}).`
      );
    }
    setModalStep("success");
  };

  const startEdit = (box) => {
    setEditingBox(box);
    setPendingBoxPayload(null);
    setModalStep("form");
    setShowAddBoxModal(true);
  };

  const openAddModal = () => {
    setEditingBox(null);
    setPendingBoxPayload(null);
    setModalStep("form");
    setShowAddBoxModal(true);
  };

  const closeModal = () => {
    setShowAddBoxModal(false);
    setEditingBox(null);
    setModalStep("form");
    setPendingBoxPayload(null);
  };

  const backToForm = () => {
    setModalStep("form");
  };

  const sortedBoxes = useMemo(
    () =>
      [...boxes].sort((a, b) => {
        if (a.bay !== b.bay) return a.bay - b.bay;
        if (a.shelf !== b.shelf) return a.shelf - b.shelf;
        if (a.row !== b.row) return a.row - b.row;
        return a.boxNumber - b.boxNumber;
      }),
    [boxes]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Box Management
          </h2>
          <p className="text-sm text-gray-600">
            Register and maintain box records to keep document locations
            synchronized with physical storage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition"
          >
            Add box
          </button>
          <CertificateBadge type={editingBox?.certificateType} />
        </div>
      </div>

      {showAddBoxModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-box-modal-title"
        >
          <div
            className="bg-white rounded-2xl border border-emerald-100 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 md:p-6 border-b border-emerald-100 flex items-center justify-between">
              <h3 id="add-box-modal-title" className="text-sm font-semibold text-gray-900">
                {modalStep === "confirm" && "Confirm box details"}
                {modalStep === "success" && "Box added"}
                {modalStep === "form" && (editingBox ? "Edit Box" : "Add New Box")}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full p-1.5 text-gray-500 hover:bg-emerald-50 hover:text-gray-700"
                aria-label="Close"
              >
                <span className="sr-only">Close</span>
                <span aria-hidden>×</span>
              </button>
            </div>
            <div className="p-5 md:p-6">
              {modalStep === "form" && (
                <BoxForm
                  key={editingBox?.id || (pendingBoxPayload ? "prefill" : "new")}
                  editingBox={editingBox}
                  prefillPayload={pendingBoxPayload && !editingBox ? pendingBoxPayload : undefined}
                  onSaved={handleSave}
                  onCancel={closeModal}
                  existingBoxes={boxes}
                />
              )}
              {modalStep === "confirm" && pendingBoxPayload && (
                <ConfirmBoxStep
                  payload={pendingBoxPayload}
                  onBack={backToForm}
                  onConfirm={handleConfirmAdd}
                />
              )}
              {modalStep === "success" && (
                <SuccessBoxOutput onDone={closeModal} />
              )}
            </div>
          </div>
        </div>
      )}

      <div className="border border-emerald-100 rounded-2xl p-4 bg-white-40/70 max-h-[28rem] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">
              Registered Boxes
            </h3>
            <p className="text-[11px] text-gray-500">
              {sortedBoxes.length} record
              {sortedBoxes.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="overflow-auto custom-scrollbar -mx-2 px-2 flex-1 min-h-0">
            {sortedBoxes.length === 0 ? (
              <p className="text-xs text-gray-500">
                No boxes registered yet. Click &quot;Add box&quot; to register a box.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[max-content]">
                  <thead>
                    <tr className="border-b border-emerald-200 bg-emerald-50/70">
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Box #</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Bay</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Shelf</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Row / Level</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Month (From – To)</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Year</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Certificate Type</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Registry Range</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Remark</th>
                      <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap text-center w-20">Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedBoxes.map((box) => (
                      <tr
                        key={box.id}
                        className="border-b border-emerald-50 bg-white hover:bg-emerald-50/50"
                      >
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">{box.boxNumber}</td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">{box.bay}</td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">{box.shelf}</td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">{box.row}</td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                          {box.monthIndexTo != null && box.monthIndexTo !== box.monthIndex
                            ? `${MONTHS[box.monthIndex]} – ${MONTHS[box.monthIndexTo]}`
                            : MONTHS[box.monthIndex]}
                        </td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">
                          {box.yearTo != null ? `${box.year} – ${box.yearTo}` : box.year}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                        <CertificateBadge type={box.certificateType} compact />
                      </td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">{box.registryRange || "—"}</td>
                        <td className="px-3 py-2 text-gray-900 whitespace-nowrap">{box.remark || "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(box);
                            }}
                            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                          >
                            Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}

function ConfirmBoxStep({ payload, onBack, onConfirm }) {
  const yearLabel = payload.yearTo != null ? `${payload.year} – ${payload.yearTo}` : String(payload.year);
  const monthLabel = payload.monthIndexTo != null && payload.monthIndexTo !== payload.monthIndex
    ? `${MONTHS[payload.monthIndex]} – ${MONTHS[payload.monthIndexTo]}`
    : MONTHS[payload.monthIndex];
  const rows = [
    { label: "Certificate type", value: <CertificateBadge type={payload.certificateType} compact /> },
    { label: "Year", value: yearLabel },
    { label: "Month", value: monthLabel },
    { label: "Box #", value: payload.boxNumber },
    { label: "Bay", value: payload.bay },
    { label: "Shelf", value: payload.shelf },
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
                <th className="px-4 py-2.5 font-semibold text-stone-500 uppercase tracking-wider w-36">Field</th>
                <th className="px-4 py-2.5 font-semibold text-stone-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ label, value }) => (
                <tr key={label} className="border-b border-stone-100 last:border-b-0">
                  <td className="px-4 py-2.5 text-stone-500 font-medium">{label}</td>
                  <td className="px-4 py-2.5 text-stone-900 font-medium">{value}</td>
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

function SuccessBoxOutput({ onDone }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <p className="text-base font-semibold text-gray-900 mb-1">Box added</p>
      <p className="text-sm text-gray-500 mb-6">The box has been added successfully.</p>
      <button
        type="button"
        onClick={onDone}
        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 hover:bg-emerald-700 transition"
      >
        Done
      </button>
    </div>
  );
}

export function BoxForm({ editingBox, prefillPayload, onSaved, onCancel, existingBoxes }) {
  const source = editingBox || prefillPayload || {};
  const [certificateType, setCertificateType] = useState(source.certificateType || "");
  const [year, setYear] = useState(source.year !== undefined && source.year !== null ? String(source.year) : "");
  const [yearTo, setYearTo] = useState(source.yearTo !== undefined && source.yearTo !== null ? String(source.yearTo) : "");
  const [monthIndex, setMonthIndex] = useState(source.monthIndex ?? null);
  const [monthIndexTo, setMonthIndexTo] = useState(source.monthIndexTo ?? null);
  const [boxNumber, setBoxNumber] = useState(source.boxNumber !== undefined && source.boxNumber !== null ? String(source.boxNumber) : "");
  const [bay, setBay] = useState(source.bay !== undefined && source.bay !== null ? String(source.bay) : "");
  const [shelf, setShelf] = useState(source.shelf !== undefined && source.shelf !== null ? String(source.shelf) : "");
  const [row, setRow] = useState(source.row !== undefined && source.row !== null ? String(source.row) : "");
  const [registryRange, setRegistryRange] = useState(source.registryRange || "");
  const [remark, setRemark] = useState(source.remark || "");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (
      !certificateType ||
      !year ||
      monthIndex == null ||
      !boxNumber ||
      !bay ||
      !shelf ||
      !row
    ) {
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

    if (!/^\d{1,3}$/.test(String(boxNumber))) {
      setError("Box number must be numeric.");
      return;
    }

    const bayNum = Number(bay);
    const shelfNum = Number(shelf);
    const rowNum = Number(row);

    if (
      bayNum < 1 ||
      bayNum > 6 ||
      shelfNum < 1 ||
      shelfNum > 6 ||
      rowNum < 1 ||
      rowNum > 6
    ) {
      setError(
        "Bay must be 1–6, Shelf 1–6, and Row/Level 1–6 to match physical layout."
      );
      return;
    }

    const duplicate = existingBoxes.find(
      (b) =>
        b.id !== editingBox?.id &&
        b.bay === bayNum &&
        b.shelf === shelfNum &&
        b.row === rowNum &&
        b.boxNumber === Number(boxNumber)
    );

    if (duplicate) {
      setError(
        "A box with the same number already exists on this bay, shelf, and row/level."
      );
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
      className="border border-emerald-100 rounded-2xl p-5 md:p-6 bg-white space-y-4"
    >
      <div className="flex items-center justify-between mb-1">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {editingBox ? "Edit Box" : "Add New Box"}
          </h3>
          <p className="text-xs text-gray-500">
            Required: type, year, Month From, box number, bay, shelf, row. You can select one or a range: e.g. January to February, 2025 to 2026. Year To and Month To are optional.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Certificate Type">
          <select
            value={certificateType}
            onChange={(e) => setCertificateType(e.target.value)}
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Same as From or leave empty (e.g. 2025 to 2026)</option>
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
              setMonthIndex(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
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
              setMonthIndexTo(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Same or after From (e.g. January to February)</option>
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
            onChange={(e) =>
              setBoxNumber(e.target.value.replace(/[^\d]/g, ""))
            }
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
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </Field>

        <Field label="Shelf (1–6)">
          <input
            type="number"
            min={1}
            max={6}
            value={shelf}
            onChange={(e) => setShelf(e.target.value)}
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </Field>

        <Field label="Row / Level (1–6)">
          <input
            type="number"
            min={1}
            max={6}
            value={row}
            onChange={(e) => setRow(e.target.value)}
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </Field>

        <Field label="Registry Number Range">
          <input
            type="text"
            value={registryRange}
            onChange={(e) => setRegistryRange(e.target.value)}
            className="w-full rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="e.g., 0001–0100"
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
              className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-emerald-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow shadow-emerald-500/30 hover:bg-emerald-700"
          >
            {editingBox ? "Update" : "Add box"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">
        {label}
      </label>
      {children}
    </div>
  );
}

