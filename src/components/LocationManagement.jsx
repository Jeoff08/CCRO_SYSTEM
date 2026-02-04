import React, { useEffect, useMemo, useRef, useState } from "react";

export const DEFAULT_ROW_LABELS = { 1: "R-1", 2: "R-2", 3: "R-3", 4: "R-4", 5: "R-5", 6: "R-T" };
export const DEFAULT_SHELF_LETTERS_BY_BAY = {
  1: ["S-A", "S-B"],
  2: ["S-A", "S-C", "S-B", "S-D"],
  3: ["S-A", "S-C", "S-B", "S-D"],
  4: ["S-A", "S-C", "S-B", "S-D"],
  5: ["S-A", "S-C", "S-B", "S-D"],
  6: ["S-A", "S-B"],
};

function normalizeShelvesInput(value) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.startsWith("S-") ? s : `S-${s}`))
    .map((s) => s.toUpperCase());
}

function validateShelvesByBay(shelfLettersByBay) {
  const errors = [];
  const bays = [1, 2, 3, 4, 5, 6];
  for (const bay of bays) {
    const shelves = shelfLettersByBay[bay] || [];
    const expected = bay === 1 || bay === 6 ? 2 : 4;
    if (shelves.length !== expected) {
      errors.push(`Bay ${bay} must have exactly ${expected} shelf letters.`);
    }
    const unique = new Set(shelves);
    if (unique.size !== shelves.length) {
      errors.push(`Bay ${bay} shelf letters must be unique.`);
    }
    for (const s of shelves) {
      if (!/^S-[A-Z]$/.test(s)) {
        errors.push(`Bay ${bay} has invalid shelf label "${s}". Use format like S-A.`);
      }
    }
  }
  return errors;
}

function makeId() {
  try {
    return crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export function LocationResultLayout({
  result,
  matchingBox,
  shelfLettersByBay,
  rowLabels,
  title = "Location result",
  isPreview = false,
}) {
  const matchCellRef = useRef(null);

  useEffect(() => {
    if (result && matchCellRef.current && !isPreview) {
      matchCellRef.current.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
    }
  }, [result, isPreview]);

  // In preview mode, allow rendering the layout table even with no result/highlight.
  if (!result && !isPreview) return null;

  const hasResult = !!result;
  const resultBay = hasResult ? (matchingBox ? matchingBox.bay : result.bay) : null;
  const resultShelf = hasResult ? (matchingBox ? matchingBox.shelf : result.shelf) : null;
  const resultRow = hasResult ? (matchingBox ? matchingBox.row : result.row) : null;
  const resultBox = hasResult ? (matchingBox ? matchingBox.boxNumber : result.box) : null;
  const shelfLabel = hasResult
    ? (shelfLettersByBay[resultBay]?.[resultShelf - 1] || `S-${resultShelf}`)
    : null;
  const rowLabel = hasResult ? (rowLabels[resultRow] || `R-${resultRow}`) : null;
  const headingSuffix = matchingBox ? " (from registered box)" : " (computed)";
  const noteSuffix = matchingBox ? " Values from registered box." : "";

  const bays = useMemo(() => {
    const keys = Object.keys(shelfLettersByBay || {})
      .map(Number)
      .filter((k) => !Number.isNaN(k))
      .sort((a, b) => a - b);
    return keys.length ? keys : [1, 2, 3, 4, 5, 6];
  }, [shelfLettersByBay]);

  const rowOrder = useMemo(() => {
    const keys = Object.keys(rowLabels || {})
      .map(Number)
      .filter((k) => !Number.isNaN(k))
      .sort((a, b) => b - a);
    return keys.length ? keys : [6, 5, 4, 3, 2, 1];
  }, [rowLabels]);

  const shelfLabels = (b) => {
    const map = shelfLettersByBay[b] || [];
    return map;
  };

  const colsPerBay = (b) => {
    const shelves = shelfLettersByBay[b] || [];
    const n = shelves.length;
    return Math.max(1, Math.ceil(n / 2));
  };

  const getShelfForCell = (bay, block, colInBlock) => {
    const cols = colsPerBay(bay);
    const shelfIndex = block * cols + colInBlock;
    return shelfIndex + 1;
  };

  const blocks = [
    { label: "S-A", shelfIndices: [0, 1] },
    { label: "S-B", shelfIndices: [2, 3] },
  ];
  const SpacerCell = () => <td className="w-6 p-0 border-none" aria-hidden />;

  return (
    <div className="mt-2 border border-emerald-100 rounded-2xl p-4 md:p-5 bg-emerald-50/60 overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {title}
        {hasResult && !isPreview && headingSuffix}
      </h3>

      {hasResult && (
        <>
          <div className="mb-4 p-4 rounded-xl bg-white border-2 border-emerald-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">
              Where the document is located
            </p>
            <p className="text-base font-semibold text-gray-900">
              Bay {resultBay} → Shelf {shelfLabel} → Row {rowLabel} → Box #{resultBox}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Go to Bay {resultBay}, find Shelf {shelfLabel}, then Row {rowLabel}. The document is in Box #{resultBox}.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[max-content]">
              <thead>
                <tr className="border-b border-emerald-200 bg-emerald-50/70">
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Document / file location</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Bay#</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Shelf</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Row / Level</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Box#</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Search Code</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 text-gray-900 border-b border-emerald-50 font-medium">
                    {`Bay ${resultBay} → Shelf ${shelfLabel} → Row ${rowLabel} → Box #${resultBox}`}
                  </td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap border-b border-emerald-50">
                    {resultBay}
                  </td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap border-b border-emerald-50">
                    {shelfLabel}
                  </td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap border-b border-emerald-50">
                    {rowLabel}
                  </td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap border-b border-emerald-50">
                    {resultBox}
                  </td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap border-b border-emerald-50 font-mono text-xs">
                    {result.searchCode}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      <h4 className="text-xs font-semibold text-gray-700 mt-4 mb-2">
        {hasResult
          ? `Block layout — document located at Bay ${resultBay}, Shelf ${shelfLabel}, Row ${rowLabel}`
          : "Block layout preview"}
      </h4>
      <div className="overflow-x-auto w-full">
        <div className="border border-emerald-200 rounded-xl overflow-hidden inline-block min-w-full">
          <table className="text-center text-sm border-collapse min-w-full">
            <thead>
              <tr className="bg-emerald-100/80 border-b border-emerald-200">
                <th className="px-4 py-2 font-semibold text-emerald-800 border border-emerald-200 w-14 min-w-[3.5rem] shrink-0" style={{ minWidth: "3.5rem" }} />
                {bays.map((bay) => (
                  <React.Fragment key={bay}>
                    <SpacerCell />
                    <th
                      colSpan={colsPerBay(bay)}
                      className="px-4 py-2 font-semibold text-emerald-800 border border-emerald-200"
                    >
                      B-{bay}
                    </th>
                  </React.Fragment>
                ))}
                <SpacerCell />
              </tr>
            </thead>
            <tbody>
              {blocks.map((block, blockIdx) => (
                <React.Fragment key={block.label}>
                  <tr className="border-b border-emerald-200">
                    <td className="px-4 py-2 font-medium text-gray-700 bg-emerald-50/70 border border-emerald-200 w-14 min-w-[3.5rem] shrink-0" />
                    {bays.map((bay) => {
                      const n = colsPerBay(bay);
                      const allLabels = shelfLabels(bay);
                      const labels = allLabels.slice(blockIdx * n, (blockIdx + 1) * n);
                      const padded = [...labels, ...Array(Math.max(0, n - labels.length)).fill(null)];
                      return (
                        <React.Fragment key={bay}>
                          <SpacerCell />
                          {padded.map((lbl, idx) => (
                            <td
                              key={`${bay}-${blockIdx}-${idx}`}
                              className="px-4 py-2 font-medium text-gray-600 border border-emerald-200 text-left min-w-[3rem] whitespace-nowrap w-14"
                            >
                              {lbl ?? ""}
                            </td>
                          ))}
                        </React.Fragment>
                      );
                    })}
                    <SpacerCell />
                  </tr>
                  {rowOrder.map((row) => (
                    <tr key={`${block.label}-${row}`} className="border-b border-emerald-100">
                      <td className="px-4 py-2 font-medium text-gray-600 bg-emerald-50/50 border border-emerald-200 w-14 min-w-[3.5rem] shrink-0 whitespace-nowrap" style={{ minWidth: "3.5rem" }}>
                        {rowLabels[row]}
                      </td>
                      {bays.map((bay) => {
                        const n = colsPerBay(bay);
                        return (
                          <React.Fragment key={bay}>
                            <SpacerCell />
                            {Array.from({ length: n }, (_, ci) => {
                              const shelf = getShelfForCell(bay, blockIdx, ci);
                              const shelfLbl = shelfLettersByBay[bay]?.[shelf - 1] || `S-${shelf}`;
                              const rowLbl = rowLabels[row] || `R-${row}`;
                              const cellLocation = `Bay ${bay}, Shelf ${shelfLbl}, Row ${rowLbl}`;
                              const isMatch = hasResult && resultBay === bay && resultShelf === shelf && resultRow === row;
                              return (
                                <td
                                  key={ci}
                                  ref={isMatch ? matchCellRef : null}
                                  className={`px-3 py-2 border-2 min-w-[3rem] ${
                                    isMatch
                                      ? "bg-emerald-600 text-white font-semibold border-emerald-700 ring-2 ring-emerald-400 ring-offset-1"
                                      : "border-emerald-200 bg-white text-gray-400"
                                  }`}
                                  title={isMatch ? `Document located here: ${cellLocation} — Box #${resultBox}` : cellLocation}
                                >
                                  {isMatch ? `Box# ${resultBox} ✓` : "—"}
                                </td>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                      <SpacerCell />
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-gray-600">
        Use this table to locate your document in physical storage. The highlighted cell shows Bay, Shelf, and Row. Hover any cell to see its location (e.g. Bay 1, Shelf S-B, Row R-3).
        {hasResult && !isPreview && noteSuffix}
      </p>
    </div>
  );
}

export default function LocationManagement({
  profiles,
  activeProfileId,
  onSetActiveProfileId,
  onUpsertProfile,
  onDeleteProfile,
}) {
  const [selectedId, setSelectedId] = useState(activeProfileId || profiles?.[0]?.id || "");
  const selectedProfile = useMemo(
    () => (profiles || []).find((p) => p.id === selectedId) || null,
    [profiles, selectedId]
  );

  useEffect(() => {
    if (activeProfileId) setSelectedId(activeProfileId);
  }, [activeProfileId]);

  useEffect(() => {
    if (!profiles || profiles.length === 0) return;
    const exists = profiles.some((p) => p.id === selectedId);
    if (!exists) {
      setSelectedId(activeProfileId || profiles[0].id);
    }
  }, [profiles, selectedId, activeProfileId]);

  const [draftName, setDraftName] = useState("");
  const [draftShelvesByBay, setDraftShelvesByBay] = useState(DEFAULT_SHELF_LETTERS_BY_BAY);
  const [draftRowLabels, setDraftRowLabels] = useState(DEFAULT_ROW_LABELS);
  const [formError, setFormError] = useState("");
  const [addBayModalOpen, setAddBayModalOpen] = useState(false);
  const [addShelfModalOpen, setAddShelfModalOpen] = useState(false);
  const [addRowsModalOpen, setAddRowsModalOpen] = useState(false);
  const [addBayNumber, setAddBayNumber] = useState("");
  const [addShelfBay, setAddShelfBay] = useState("");
  const [addShelfLetters, setAddShelfLetters] = useState("");
  const [addRowsBay, setAddRowsBay] = useState("");
  const [addRowsShelf, setAddRowsShelf] = useState("");
  const [addRowsInput, setAddRowsInput] = useState("");

  useEffect(() => {
    if (!selectedProfile) return;
    setDraftName(selectedProfile.name || "");
    setDraftShelvesByBay(selectedProfile.shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY);
    setDraftRowLabels(selectedProfile.rowLabels || DEFAULT_ROW_LABELS);
    setFormError("");
  }, [selectedProfile]);

  const previewResult = null;
  const previewMatchingBox = null;

  const handleCreate = () => {
    const base = {
      shelfLettersByBay: DEFAULT_SHELF_LETTERS_BY_BAY,
      rowLabels: DEFAULT_ROW_LABELS,
    };
    const id = makeId();
    onUpsertProfile({
      id,
      name: `New profile ${new Date().toLocaleDateString()}`,
      shelfLettersByBay: base.shelfLettersByBay,
      rowLabels: base.rowLabels,
      updatedAt: new Date().toISOString(),
    });
    setSelectedId(id);
    setFormError("");
  };

  const handleSave = () => {
    if (!selectedProfile) return;
    const name = (draftName && draftName.trim()) || selectedProfile.name || "Profile";
    const normalized = {};
    const bayKeys = Object.keys(draftShelvesByBay).map(Number).filter((b) => !Number.isNaN(b));
    for (const bay of bayKeys) {
      const list = (draftShelvesByBay[bay] || []).map((s) => String(s).toUpperCase());
      if (list.length) normalized[bay] = list;
    }
    const errors = validateShelvesByBay({ ...DEFAULT_SHELF_LETTERS_BY_BAY, ...normalized });
    if (errors.length) {
      setFormError(errors[0]);
      return;
    }
    onUpsertProfile({
      ...selectedProfile,
      name,
      shelfLettersByBay: normalized,
      rowLabels: draftRowLabels,
      updatedAt: new Date().toISOString(),
    });
    setFormError("");
  };

  const handleDelete = () => {
    if (!selectedProfile) return;
    if ((profiles || []).length <= 1) {
      setFormError("You must keep at least one location profile.");
      return;
    }
    const ok = window.confirm(`Delete "${selectedProfile.name}"? This cannot be undone.`);
    if (!ok) return;
    onDeleteProfile(selectedProfile.id);
  };

  const handleSetActive = (profileId) => {
    if (profileId) onSetActiveProfileId(profileId);
  };

  const bayNumbers = useMemo(() => {
    return Object.keys(draftShelvesByBay)
      .map(Number)
      .filter((b) => !Number.isNaN(b))
      .sort((a, b) => a - b);
  }, [draftShelvesByBay]);

  const handleAddBay = () => {
    const num = addBayNumber.trim() ? parseInt(addBayNumber.trim(), 10) : null;
    if (num == null || Number.isNaN(num) || num < 1) {
      setFormError("Enter a valid bay number (e.g. 7).");
      return false;
    }
    if (draftShelvesByBay[num]) {
      setFormError(`Bay ${num} already exists.`);
      return false;
    }
    setDraftShelvesByBay((prev) => ({ ...prev, [num]: [] }));
    setAddBayNumber("");
    setFormError("");
    return true;
  };

  const handleAddShelf = () => {
    const bay = addShelfBay === "" ? null : parseInt(addShelfBay, 10);
    if (bay == null || Number.isNaN(bay) || !draftShelvesByBay[bay]) {
      setFormError("Select a bay.");
      return false;
    }
    const letters = normalizeShelvesInput(addShelfLetters);
    if (letters.length === 0) {
      setFormError("Enter at least one shelf letter (e.g. S-A, S-B).");
      return false;
    }
    const existing = draftShelvesByBay[bay] || [];
    const combined = [...existing];
    letters.forEach((l) => {
      if (!combined.includes(l)) combined.push(l);
    });
    setDraftShelvesByBay((prev) => ({ ...prev, [bay]: combined }));
    setAddShelfLetters("");
    setFormError("");
    return true;
  };

  const handleAddRows = () => {
    const bay = addRowsBay === "" ? null : parseInt(addRowsBay, 10);
    if (bay == null || Number.isNaN(bay) || !draftShelvesByBay[bay]) {
      setFormError("Select a bay.");
      return false;
    }
    const shelves = draftShelvesByBay[bay] || [];
    if (!addRowsShelf || !shelves.includes(addRowsShelf)) {
      setFormError("Select a shelf for this bay.");
      return false;
    }
    const parts = addRowsInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) {
      setFormError("Enter at least one row label (e.g. R-T, R-6, T-5).");
      return false;
    }
    const existingIndices = Object.keys(draftRowLabels).map(Number).filter((k) => !Number.isNaN(k));
    const maxIndex = existingIndices.length ? Math.max(...existingIndices) : 0;
    const labels = { ...draftRowLabels };
    parts.forEach((label, i) => {
      const normalized = /^R-.+$/.test(label) ? label : `R-${label}`;
      labels[maxIndex + 1 + i] = normalized;
    });
    setDraftRowLabels(labels);
    setAddRowsInput("");
    setFormError("");
    return true;
  };

  const closeModal = () => {
    setAddBayModalOpen(false);
    setAddShelfModalOpen(false);
    setAddRowsModalOpen(false);
    setFormError("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Location Management</h2>
          <p className="text-sm text-gray-600">
            Create, update, and delete location profiles (shelf mapping). The active profile is used by Document Locator output.
          </p>
        </div>
      </div>


        <div className="md:col-span-2 space-y-4">
          <div className="border border-emerald-100 rounded-2xl bg-emerald-50/60 p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Location Management</h3>
              <div className="flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!selectedProfile}
                  className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  Update
                </button>
      
              </div>
            </div>

            {selectedProfile && (
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setFormError(""); setAddBayNumber(""); setAddBayModalOpen(true); }}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Add bay
                </button>
                <button
                  type="button"
                  onClick={() => { setFormError(""); setAddShelfBay(bayNumbers.length ? String(bayNumbers[0]) : ""); setAddShelfLetters(""); setAddShelfModalOpen(true); }}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Add shelf
                </button>
                <button
                  type="button"
                  onClick={() => { const b = bayNumbers[0]; setFormError(""); setAddRowsBay(bayNumbers.length ? String(b) : ""); setAddRowsShelf((draftShelvesByBay[b] || [])[0] ?? ""); setAddRowsInput(""); setAddRowsModalOpen(true); }}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Add rows
                </button>
              </div>
            )}

            {addBayModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal} aria-modal="true" role="dialog">
                <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Add bay</h3>
                    <button type="button" onClick={closeModal} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Bay (number)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={addBayNumber}
                      onChange={(e) => setAddBayNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 7"
                      className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  {formError && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>}
                  <div className="mt-4 flex gap-2 justify-end">
                    <button type="button" onClick={closeModal} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50">Cancel</button>
                    <button type="button" onClick={() => { if (handleAddBay()) setAddBayModalOpen(false); }} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Add</button>
                  </div>
                </div>
              </div>
            )}

            {addShelfModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal} aria-modal="true" role="dialog">
                <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Add shelf</h3>
                    <button type="button" onClick={closeModal} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Selected bay</label>
                      <select
                        value={addShelfBay}
                        onChange={(e) => setAddShelfBay(e.target.value)}
                        className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Select bay</option>
                        {bayNumbers.map((b) => (
                          <option key={b} value={b}>B-{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Shelf (letter)</label>
                      <input
                        type="text"
                        value={addShelfLetters}
                        onChange={(e) => setAddShelfLetters(e.target.value)}
                        placeholder="e.g. S-A, S-B or S-C"
                        className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  {formError && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>}
                  <div className="mt-4 flex gap-2 justify-end">
                    <button type="button" onClick={closeModal} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50">Cancel</button>
                    <button type="button" onClick={() => { if (handleAddShelf()) setAddShelfModalOpen(false); }} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Add</button>
                  </div>
                </div>
              </div>
            )}

            {addRowsModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeModal} aria-modal="true" role="dialog">
                <div className="bg-white rounded-2xl shadow-xl border border-emerald-100 p-5 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">Add rows</h3>
                    <button type="button" onClick={closeModal} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700" aria-label="Close">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Selected bay</label>
                      <select
                        value={addRowsBay}
                        onChange={(e) => { const b = parseInt(e.target.value, 10); setAddRowsBay(e.target.value); setAddRowsShelf((draftShelvesByBay[b] || [])[0] ?? ""); }}
                        className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        <option value="">Select bay</option>
                        {bayNumbers.map((b) => (
                          <option key={b} value={b}>B-{b}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Selected shelf</label>
                      <select
                        value={addRowsShelf}
                        onChange={(e) => setAddRowsShelf(e.target.value)}
                        className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      >
                        {(draftShelvesByBay[parseInt(addRowsBay, 10)] || []).map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Rows (e.g. R-T, R-6, T-5)</label>
                      <input
                        type="text"
                        value={addRowsInput}
                        onChange={(e) => setAddRowsInput(e.target.value)}
                        placeholder="e.g. R-T, R-6, T-5"
                        className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  {formError && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>}
                  <div className="mt-4 flex gap-2 justify-end">
                    <button type="button" onClick={closeModal} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50">Cancel</button>
                    <button type="button" onClick={() => { if (handleAddRows()) setAddRowsModalOpen(false); }} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Add</button>
                  </div>
                </div>
              </div>
            )}

            {!selectedProfile ? (
              <p className="text-sm text-gray-600">Select a profile to edit.</p>
            ) : (
              formError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {formError}
                </p>
              )
            )}
          </div>

          <div className="border border-emerald-100 rounded-2xl bg-emerald-50/60 p-4 md:p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Layout Preview</h3>
            <LocationResultLayout
              result={previewResult}
              matchingBox={previewMatchingBox}
              shelfLettersByBay={selectedProfile ? (selectedProfile.id === selectedId ? draftShelvesByBay : selectedProfile.shelfLettersByBay) : DEFAULT_SHELF_LETTERS_BY_BAY}
              rowLabels={selectedProfile && selectedProfile.id === selectedId ? draftRowLabels : (selectedProfile?.rowLabels || DEFAULT_ROW_LABELS)}
              title="Document Locator output layout"
              isPreview
            />
          </div>
        </div>
      </div>
  );
}
