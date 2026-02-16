import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Modal, Toast } from "../ui/index.js";
import { DEFAULT_ROW_LABELS, DEFAULT_SHELF_LETTERS_BY_BAY } from "../../constants/index.js";
import { normalizeShelvesInput, validateShelvesByBay, makeId } from "../../utils/index.js";
import LocationRack3D from "./LocationRack3D.jsx";

export default function LocationManagement({
  profiles,
  activeProfileId,
  onSetActiveProfileId,
  onUpsertProfile,
  onDeleteProfile,
  onDirtyChange,
  saveRef,
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
    if (!exists) setSelectedId(activeProfileId || profiles[0].id);
  }, [profiles, selectedId, activeProfileId]);

  /* ── Draft state ── */
  const [draftName, setDraftName] = useState("");
  const [draftShelvesByBay, setDraftShelvesByBay] = useState(DEFAULT_SHELF_LETTERS_BY_BAY);
  const [draftRowLabels, setDraftRowLabels] = useState(DEFAULT_ROW_LABELS);
  const [formError, setFormError] = useState("");

  /* ── Dirty-state tracking ── */
  const isDirty = useMemo(() => {
    if (!selectedProfile) return false;
    const savedName = selectedProfile.name || "";
    const savedShelves = selectedProfile.shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY;
    const savedRows = selectedProfile.rowLabels || DEFAULT_ROW_LABELS;
    if (draftName !== savedName) return true;
    if (JSON.stringify(draftShelvesByBay) !== JSON.stringify(savedShelves)) return true;
    if (JSON.stringify(draftRowLabels) !== JSON.stringify(savedRows)) return true;
    return false;
  }, [selectedProfile, draftName, draftShelvesByBay, draftRowLabels]);

  useEffect(() => {
    if (onDirtyChange) onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  /* ── Modal flags ── */
  const [addBayModalOpen, setAddBayModalOpen] = useState(false);
  const [addShelfModalOpen, setAddShelfModalOpen] = useState(false);
  const [addRowsModalOpen, setAddRowsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saveConfirmOpen, setSaveConfirmOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState("bay");

  /* ── Modal inputs ── */
  const [addBayNumber, setAddBayNumber] = useState("");
  const [deleteBayNumber, setDeleteBayNumber] = useState("");
  const [deleteShelfBay, setDeleteShelfBay] = useState("");
  const [deleteShelfLabel, setDeleteShelfLabel] = useState("");
  const [deleteRowKey, setDeleteRowKey] = useState("");
  const [addShelfBay, setAddShelfBay] = useState("");
  const [addShelfLetters, setAddShelfLetters] = useState("");
  const [addRowsBay, setAddRowsBay] = useState("");
  const [addRowsShelf, setAddRowsShelf] = useState("");
  const [addRowsInput, setAddRowsInput] = useState("");

  /* ── Inline editing ── */
  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  /* ── Layout view mode ── */
  const [layoutView, setLayoutView] = useState("2d");

  /* ── Toasts ── */
  const [successMessage, setSuccessMessage] = useState("");
  const [warningMessage, setWarningMessage] = useState("");

  /* ── Sync draft from selected profile ── */
  useEffect(() => {
    if (!selectedProfile) return;
    setDraftName(selectedProfile.name || "");
    setDraftShelvesByBay(selectedProfile.shelfLettersByBay || DEFAULT_SHELF_LETTERS_BY_BAY);
    setDraftRowLabels(selectedProfile.rowLabels || DEFAULT_ROW_LABELS);
    setFormError("");
  }, [selectedProfile]);

  /* ── Auto-dismiss toasts ── */
  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  useEffect(() => {
    if (warningMessage) {
      const t = setTimeout(() => setWarningMessage(""), 6000);
      return () => clearTimeout(t);
    }
  }, [warningMessage]);

  /* ── Derived ── */
  const bayNumbers = useMemo(
    () =>
      Object.keys(draftShelvesByBay)
        .map(Number)
        .filter((b) => !Number.isNaN(b))
        .sort((a, b) => a - b),
    [draftShelvesByBay]
  );

  /* ── Handlers: save / create / delete profile ── */
  const handleSave = useCallback(() => {
    if (!selectedProfile) return false;
    const name = (draftName && draftName.trim()) || selectedProfile.name || "Profile";
    const normalized = {};
    const bayKeys = Object.keys(draftShelvesByBay).map(Number).filter((b) => !Number.isNaN(b));
    for (const bay of bayKeys) {
      const list = (draftShelvesByBay[bay] || []).map((s) => String(s).toUpperCase());
      if (list.length) normalized[bay] = list;
    }
    const errors = validateShelvesByBay({ ...DEFAULT_SHELF_LETTERS_BY_BAY, ...normalized });
    if (errors.length) { setFormError(errors[0]); return false; }
    onUpsertProfile({ ...selectedProfile, name, shelfLettersByBay: normalized, rowLabels: draftRowLabels, updatedAt: new Date().toISOString() });
    setFormError("");
    setSuccessMessage("Changes saved successfully!");
    return true;
  }, [selectedProfile, draftName, draftShelvesByBay, draftRowLabels, onUpsertProfile]);

  const handleSaveClick = useCallback(() => {
    if (!selectedProfile) return;
    setFormError("");
    if (!isDirty) {
      setWarningMessage("No changes to save. Everything is already up to date.");
      return;
    }
    setSaveConfirmOpen(true);
  }, [selectedProfile, isDirty]);

  /* ── Expose save for parent (unsaved-changes guard) ── */
  useEffect(() => {
    if (saveRef) saveRef.current = handleSave;
  }, [saveRef, handleSave]);

  const handleDelete = () => {
    if (!selectedProfile) return;
    if ((profiles || []).length <= 1) { setFormError("You must keep at least one location profile."); return; }
    const ok = window.confirm(`Delete "${selectedProfile.name}"? This cannot be undone.`);
    if (!ok) return;
    onDeleteProfile(selectedProfile.id);
  };

  /* ── Handlers: add bay / shelf / rows ── */
  const handleAddBay = () => {
    const num = addBayNumber.trim() ? parseInt(addBayNumber.trim(), 10) : null;
    if (num == null || Number.isNaN(num) || num < 1) { setFormError("Enter a valid bay number (e.g. 7)."); return false; }
    if (draftShelvesByBay[num]) { setFormError(`Bay ${num} already exists.`); return false; }
    const existingBays = Object.keys(draftShelvesByBay).map(Number).filter((b) => !Number.isNaN(b)).sort((a, b) => a - b);
    const expectedNext = existingBays.length === 0 ? 1 : Math.max(...existingBays) + 1;
    if (num !== expectedNext) {
      setFormError(`Bay numbers must be sequential. Expected B-${expectedNext} (next in sequence).`);
      return false;
    }
    setDraftShelvesByBay((prev) => {
      const next = { ...prev, [num]: [] };
      const sortedKeys = Object.keys(next).map(Number).filter((b) => !Number.isNaN(b)).sort((a, b) => a - b);
      const sorted = {};
      sortedKeys.forEach((key) => { sorted[key] = next[key]; });
      return sorted;
    });
    setAddBayNumber("");
    setFormError("");
    setSuccessMessage(`Bay B-${num} added successfully!`);
    return true;
  };

  const handleAddShelf = () => {
    const bay = addShelfBay === "" ? null : parseInt(addShelfBay, 10);
    if (bay == null || Number.isNaN(bay) || !draftShelvesByBay[bay]) { setFormError("Select a bay."); return false; }
    const letters = normalizeShelvesInput(addShelfLetters);
    if (letters.length === 0) { setFormError("Enter at least one shelf letter (e.g. S-A, S-B)."); return false; }
    const existing = (draftShelvesByBay[bay] || []).sort((a, b) => a.localeCompare(b));
    // Validate sequential order
    const lastShelf = existing.length > 0 ? existing[existing.length - 1] : null;
    if (lastShelf) {
      const lastLetter = lastShelf.match(/^S-([A-Z])$/)?.[1];
      if (lastLetter) {
        const expectedNextLetterCode = lastLetter.charCodeAt(0) + 1;
        if (expectedNextLetterCode > 90) { // Z is 90
          setFormError("Cannot add more shelves. Maximum shelf letter (S-Z) reached.");
          return false;
        }
        const expectedNextShelf = `S-${String.fromCharCode(expectedNextLetterCode)}`;
        // Check if first letter matches expected next
        if (letters[0] !== expectedNextShelf) {
          setFormError(`Shelves must be sequential. Expected ${expectedNextShelf} (next in sequence after ${lastShelf}).`);
          return false;
        }
        // Validate all letters are sequential
        for (let i = 0; i < letters.length; i++) {
          const expectedLetterCode = expectedNextLetterCode + i;
          if (expectedLetterCode > 90) {
            setFormError(`Cannot add more shelves. Maximum shelf letter (S-Z) reached.`);
            return false;
          }
          const expectedShelf = `S-${String.fromCharCode(expectedLetterCode)}`;
          if (letters[i] !== expectedShelf) {
            setFormError(`Shelves must be sequential. Expected ${expectedShelf} at position ${i + 1}.`);
            return false;
          }
        }
      }
    } else {
      // First shelf must be S-A
      if (letters[0] !== "S-A") {
        setFormError("Shelves must start with S-A. Expected S-A (first shelf).");
        return false;
      }
      // Validate all letters are sequential starting from A
      for (let i = 0; i < letters.length; i++) {
        const expectedLetterCode = 65 + i; // A is 65
        if (expectedLetterCode > 90) {
          setFormError(`Cannot add more shelves. Maximum shelf letter (S-Z) reached.`);
          return false;
        }
        const expectedShelf = `S-${String.fromCharCode(expectedLetterCode)}`;
        if (letters[i] !== expectedShelf) {
          setFormError(`Shelves must be sequential. Expected ${expectedShelf} at position ${i + 1}.`);
          return false;
        }
      }
    }
    const combined = [...existing];
    letters.forEach((l) => { if (!combined.includes(l)) combined.push(l); });
    combined.sort((a, b) => a.localeCompare(b));
    setDraftShelvesByBay((prev) => ({ ...prev, [bay]: combined }));
    setAddShelfLetters("");
    setFormError("");
    setSuccessMessage(`Shelf${letters.length > 1 ? "s" : ""} ${letters.join(", ")} added to Bay B-${bay} successfully!`);
    return true;
  };

  const handleAddRows = () => {
    const bay = addRowsBay === "" ? null : parseInt(addRowsBay, 10);
    if (bay == null || Number.isNaN(bay) || !draftShelvesByBay[bay]) { setFormError("Select a bay."); return false; }
    const shelves = draftShelvesByBay[bay] || [];
    if (!addRowsShelf || !shelves.includes(addRowsShelf)) { setFormError("Select a shelf for this bay."); return false; }
    const parts = addRowsInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length === 0) { setFormError("Enter at least one row label (e.g. R-6, R-5)."); return false; }
    const existingIndices = Object.keys(draftRowLabels).map(Number).filter((k) => !Number.isNaN(k));
    const maxIndex = existingIndices.length ? Math.max(...existingIndices) : 0;
    const expectedNext = maxIndex + 1;
    // Extract numeric part from existing row labels to determine sequence
    const existingRowNumbers = Object.values(draftRowLabels)
      .map((label) => {
        const match = label.match(/^R-(\d+)$/);
        return match ? parseInt(match[1], 10) : null;
      })
      .filter((n) => n != null)
      .sort((a, b) => a - b);
    const maxRowNumber = existingRowNumbers.length > 0 ? Math.max(...existingRowNumbers) : 0;
    const expectedNextRowNumber = maxRowNumber + 1;
    // Validate that the first row being added matches the expected next number
    const firstPart = parts[0];
    const firstNormalized = /^R-.+$/.test(firstPart) ? firstPart : `R-${firstPart}`;
    const firstMatch = firstNormalized.match(/^R-(\d+)$/);
    if (!firstMatch) {
      setFormError(`Row labels must be numeric (e.g. R-${expectedNextRowNumber}).`);
      return false;
    }
    const firstRowNumber = parseInt(firstMatch[1], 10);
    if (firstRowNumber !== expectedNextRowNumber) {
      setFormError(`Rows must be sequential. Expected R-${expectedNextRowNumber} (next in sequence).`);
      return false;
    }
    // Validate all rows are sequential
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const normalized = /^R-.+$/.test(part) ? part : `R-${part}`;
      const match = normalized.match(/^R-(\d+)$/);
      if (!match) {
        setFormError(`Row labels must be numeric (e.g. R-${expectedNextRowNumber + i}).`);
        return false;
      }
      const rowNumber = parseInt(match[1], 10);
      if (rowNumber !== expectedNextRowNumber + i) {
        setFormError(`Rows must be sequential. Expected R-${expectedNextRowNumber + i} at position ${i + 1}.`);
        return false;
      }
    }
    const labels = { ...draftRowLabels };
    const normalizedLabels = [];
    parts.forEach((label, i) => {
      const normalized = /^R-.+$/.test(label) ? label : `R-${label}`;
      labels[expectedNext + i] = normalized;
      normalizedLabels.push(normalized);
    });
    setDraftRowLabels(labels);
    setAddRowsInput("");
    setFormError("");
    setSuccessMessage(`Row${normalizedLabels.length > 1 ? "s" : ""} ${normalizedLabels.join(", ")} added successfully!`);
    return true;
  };

  /* ── Handlers: delete bay / shelf / row ── */
  const handleDeleteBay = () => {
    const num = deleteBayNumber.trim() ? parseInt(deleteBayNumber.trim(), 10) : null;
    if (num == null || Number.isNaN(num) || num < 1 || !draftShelvesByBay[num]) { setFormError("Select a valid bay to delete."); return false; }
    setDraftShelvesByBay((prev) => { const next = { ...prev }; delete next[num]; return next; });
    if (addShelfBay && parseInt(addShelfBay, 10) === num) setAddShelfBay("");
    if (addRowsBay && parseInt(addRowsBay, 10) === num) { setAddRowsBay(""); setAddRowsShelf(""); }
    setDeleteBayNumber("");
    setFormError("");
    return true;
  };

  const handleDeleteShelf = () => {
    const bay = deleteShelfBay === "" ? null : parseInt(deleteShelfBay, 10);
    if (bay == null || !draftShelvesByBay[bay]) { setFormError("Select a valid bay."); return false; }
    const shelves = draftShelvesByBay[bay] || [];
    if (!deleteShelfLabel || !shelves.includes(deleteShelfLabel)) { setFormError("Select a shelf to delete."); return false; }
    setDraftShelvesByBay((prev) => ({ ...prev, [bay]: (prev[bay] || []).filter((s) => s !== deleteShelfLabel) }));
    setDeleteShelfLabel("");
    setFormError("");
    return true;
  };

  const handleDeleteRow = () => {
    const key = deleteRowKey === "" ? null : parseInt(deleteRowKey, 10);
    if (key == null || !draftRowLabels[key]) { setFormError("Select a row label to delete."); return false; }
    const keys = Object.keys(draftRowLabels).map(Number).filter((k) => !Number.isNaN(k));
    if (keys.length <= 1) { setFormError("You must keep at least one row label."); return false; }
    setDraftRowLabels((prev) => { const next = { ...prev }; delete next[key]; return next; });
    setDeleteRowKey("");
    setFormError("");
    return true;
  };

  const handleDeleteSubmit = () => {
    let result = false;
    if (deleteMode === "bay") { result = handleDeleteBay(); if (result) setSuccessMessage(`Bay deleted successfully!`); }
    else if (deleteMode === "shelf") { result = handleDeleteShelf(); if (result) setSuccessMessage(`Shelf deleted successfully!`); }
    else if (deleteMode === "row") { result = handleDeleteRow(); if (result) setSuccessMessage(`Row deleted successfully!`); }
    else { setFormError("Select what to delete."); return false; }
    return result;
  };

  const deleteSummary = useMemo(() => {
    if (deleteMode === "bay") return deleteBayNumber?.trim() ? `Bay B-${deleteBayNumber.trim()}` : "selected bay";
    if (deleteMode === "shelf") return deleteShelfBay && deleteShelfLabel ? `Shelf ${deleteShelfLabel} (Bay B-${deleteShelfBay})` : "selected shelf";
    if (deleteMode === "row") {
      const key = deleteRowKey === "" ? null : parseInt(deleteRowKey, 10);
      const label = key != null && !Number.isNaN(key) ? draftRowLabels?.[key] : "";
      return label ? `Row label ${label}` : "selected row label";
    }
    return "selected item";
  }, [deleteMode, deleteBayNumber, deleteShelfBay, deleteShelfLabel, deleteRowKey, draftRowLabels]);

  const closeModal = () => {
    setAddBayModalOpen(false);
    setAddShelfModalOpen(false);
    setAddRowsModalOpen(false);
    setDeleteModalOpen(false);
    setDeleteConfirmOpen(false);
    setSaveConfirmOpen(false);
    setFormError("");
  };

  /* ── Inline-edit helpers ── */
  const commitBayEdit = (bay) => {
    const trimmed = editingValue.trim();
    if (!trimmed || trimmed === `B-${bay}`) { setEditingCell(null); setEditingValue(""); return; }
    const match = trimmed.match(/^B?-?(\d+)$/);
    if (!match) { setWarningMessage(`Invalid bay value "${trimmed}". Bay must be a number (e.g., B-1, B-7).`); }
    else {
      const newBay = parseInt(match[1], 10);
      if (newBay !== bay) {
        if (draftShelvesByBay[newBay]) {
          setWarningMessage(`Bay B-${newBay} already exists.`);
        } else {
          // Check if the new bay number maintains sequential order
          const existingBays = Object.keys(draftShelvesByBay)
            .map(Number)
            .filter((b) => !Number.isNaN(b) && b !== bay)
            .sort((a, b) => a - b);
          const minBay = existingBays.length > 0 ? Math.min(...existingBays) : null;
          const maxBay = existingBays.length > 0 ? Math.max(...existingBays) : null;
          
          // Check if newBay creates a gap or is out of sequence
          if (existingBays.length > 0) {
            // Check if newBay is within the existing range
            if (newBay < minBay || newBay > maxBay + 1) {
              setWarningMessage(`Bay numbers must be sequential. B-${newBay} would create a gap. Expected a number between B-${minBay} and B-${maxBay + 1}.`);
            } else {
              // Check for gaps in the sequence
              const allBays = [...existingBays, newBay].sort((a, b) => a - b);
              let hasGap = false;
              for (let i = 0; i < allBays.length - 1; i++) {
                if (allBays[i + 1] - allBays[i] > 1) {
                  hasGap = true;
                  break;
                }
              }
              if (hasGap) {
                setWarningMessage(`Bay numbers must be sequential without gaps. B-${newBay} would create a gap in the sequence.`);
              } else {
                setDraftShelvesByBay((prev) => {
                  const next = { ...prev };
                  next[newBay] = prev[bay] || [];
                  delete next[bay];
                  const sortedKeys = Object.keys(next).map(Number).filter((b) => !Number.isNaN(b)).sort((a, b) => a - b);
                  const sorted = {};
                  sortedKeys.forEach((key) => { sorted[key] = next[key]; });
                  return sorted;
                });
              }
            }
          } else {
            // Only one bay, must be B-1
            if (newBay !== 1) {
              setWarningMessage(`Bay numbers must start with B-1.`);
            } else {
              setDraftShelvesByBay((prev) => {
                const next = { ...prev };
                next[newBay] = prev[bay] || [];
                delete next[bay];
                const sortedKeys = Object.keys(next).map(Number).filter((b) => !Number.isNaN(b)).sort((a, b) => a - b);
                const sorted = {};
                sortedKeys.forEach((key) => { sorted[key] = next[key]; });
                return sorted;
              });
            }
          }
        }
      }
    }
    setEditingCell(null); setEditingValue("");
  };

  const commitShelfEdit = (bay, shelfIdx) => {
    const trimmed = editingValue.trim();
    const originalLabel = (draftShelvesByBay[bay] || [])[shelfIdx];
    if (!trimmed || trimmed === originalLabel) { setEditingCell(null); setEditingValue(""); return; }
    if (/^S-[A-Z]$/.test(trimmed)) {
      const existing = (draftShelvesByBay[bay] || []).filter((_, i) => i !== shelfIdx);
      if (existing.includes(trimmed)) {
        setWarningMessage(`Shelf "${trimmed}" already exists in Bay B-${bay}.`);
      } else {
        // Check if the new shelf maintains sequential alphabetical order
        const existingSorted = [...existing].sort((a, b) => a.localeCompare(b));
        const newLetter = trimmed.match(/^S-([A-Z])$/)?.[1];
        if (newLetter) {
          const newLetterCode = newLetter.charCodeAt(0);
          const existingLetters = existingSorted.map((s) => s.match(/^S-([A-Z])$/)?.[1]).filter(Boolean);
          
          if (existingLetters.length === 0) {
            // Only one shelf, must be S-A
            if (trimmed !== "S-A") {
              setWarningMessage(`Shelves must start with S-A.`);
            } else {
              setDraftShelvesByBay((prev) => { const next = { ...prev }; const s = [...(next[bay] || [])]; if (s[shelfIdx] !== undefined) { s[shelfIdx] = trimmed; s.sort((a, b) => a.localeCompare(b)); next[bay] = s; } return next; });
            }
          } else {
            // Check if newLetter fits in the sequence
            const minLetterCode = Math.min(...existingLetters.map((l) => l.charCodeAt(0)));
            const maxLetterCode = Math.max(...existingLetters.map((l) => l.charCodeAt(0)));
            
            // Check if newLetter is within the existing range or one after max
            if (newLetterCode < minLetterCode || newLetterCode > maxLetterCode + 1) {
              const minShelf = `S-${String.fromCharCode(minLetterCode)}`;
              const maxShelf = `S-${String.fromCharCode(maxLetterCode)}`;
              const nextShelf = `S-${String.fromCharCode(maxLetterCode + 1)}`;
              setWarningMessage(`Shelves must be sequential. ${trimmed} would create a gap. Expected a letter between ${minShelf} and ${nextShelf}.`);
            } else {
              // Check for gaps in the sequence
              const allLetters = [...existingLetters, newLetter].map((l) => l.charCodeAt(0)).sort((a, b) => a - b);
              let hasGap = false;
              for (let i = 0; i < allLetters.length - 1; i++) {
                if (allLetters[i + 1] - allLetters[i] > 1) {
                  hasGap = true;
                  break;
                }
              }
              if (hasGap) {
                setWarningMessage(`Shelves must be sequential without gaps. ${trimmed} would create a gap in the sequence.`);
              } else {
                setDraftShelvesByBay((prev) => { const next = { ...prev }; const s = [...(next[bay] || [])]; if (s[shelfIdx] !== undefined) { s[shelfIdx] = trimmed; s.sort((a, b) => a.localeCompare(b)); next[bay] = s; } return next; });
              }
            }
          }
        }
      }
    } else {
      setWarningMessage(`Invalid shelf label "${trimmed}". Expected format: S-A.`);
    }
    setEditingCell(null); setEditingValue("");
  };

  const commitRowEdit = (row) => {
    const trimmed = editingValue.trim();
    const originalLabel = draftRowLabels[row];
    if (!trimmed || trimmed === originalLabel) { setEditingCell(null); setEditingValue(""); return; }
    if (/^R-.+$/.test(trimmed)) {
      const existing = Object.entries(draftRowLabels).filter(([k]) => Number(k) !== row).map(([, v]) => v);
      if (existing.includes(trimmed)) {
        setWarningMessage(`Row label "${trimmed}" already exists.`);
      } else {
        // Check if the new row maintains sequential numeric order
        const match = trimmed.match(/^R-(\d+)$/);
        if (!match) {
          setWarningMessage(`Row labels must be numeric (e.g., R-1, R-2).`);
        } else {
          const newRowNumber = parseInt(match[1], 10);
          const existingRowNumbers = existing
            .map((label) => {
              const m = label.match(/^R-(\d+)$/);
              return m ? parseInt(m[1], 10) : null;
            })
            .filter((n) => n != null)
            .sort((a, b) => a - b);
          
          if (existingRowNumbers.length === 0) {
            // Only one row, must be R-1
            if (newRowNumber !== 1) {
              setWarningMessage(`Rows must start with R-1.`);
            } else {
              setDraftRowLabels((prev) => ({ ...prev, [row]: trimmed }));
            }
          } else {
            // Check if newRowNumber fits in the sequence
            const minRowNumber = Math.min(...existingRowNumbers);
            const maxRowNumber = Math.max(...existingRowNumbers);
            
            // Check if newRowNumber is within the existing range or one after max
            if (newRowNumber < minRowNumber || newRowNumber > maxRowNumber + 1) {
              const minRow = `R-${minRowNumber}`;
              const maxRow = `R-${maxRowNumber}`;
              const nextRow = `R-${maxRowNumber + 1}`;
              setWarningMessage(`Rows must be sequential. ${trimmed} would create a gap. Expected a number between ${minRow} and ${nextRow}.`);
            } else {
              // Check for gaps in the sequence
              const allRowNumbers = [...existingRowNumbers, newRowNumber].sort((a, b) => a - b);
              let hasGap = false;
              for (let i = 0; i < allRowNumbers.length - 1; i++) {
                if (allRowNumbers[i + 1] - allRowNumbers[i] > 1) {
                  hasGap = true;
                  break;
                }
              }
              if (hasGap) {
                setWarningMessage(`Rows must be sequential without gaps. ${trimmed} would create a gap in the sequence.`);
              } else {
                setDraftRowLabels((prev) => ({ ...prev, [row]: trimmed }));
              }
            }
          }
        }
      }
    } else {
      setWarningMessage(`Invalid row label "${trimmed}". Must start with "R-" (e.g., R-1).`);
    }
    setEditingCell(null); setEditingValue("");
  };

  const onKeyDown = (e, commitFn) => {
    if (e.key === "Enter") e.target.blur();
    else if (e.key === "Escape") { setEditingCell(null); setEditingValue(""); }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Location Management</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Configure and manage location profiles to match your physical archive layout. Edit bays, shelves, and rows directly in the table below.
            </p>
          </div>
        </div>

        {/* Controls card */}
        <div className="md:col-span-2 space-y-5">
          <div className="border-2 border-emerald-200/60 rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 p-5 md:p-6 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                Location Configuration
              </h3>
            </div>

            {selectedProfile && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => { setFormError(""); setAddBayNumber(""); setAddBayModalOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Add bay
                  </button>
                  <button type="button" onClick={() => { setFormError(""); setAddShelfBay(bayNumbers.length ? String(bayNumbers[0]) : ""); setAddShelfLetters(""); setAddShelfModalOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Add shelf
                  </button>
                  <button type="button" onClick={() => { const b = bayNumbers[0]; setFormError(""); setAddRowsBay(bayNumbers.length ? String(b) : ""); setAddRowsShelf((draftShelvesByBay[b] || [])[0] ?? ""); setAddRowsInput(""); setAddRowsModalOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-md">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Add rows
                  </button>
                  <button type="button" onClick={() => { const firstBay = bayNumbers[0]; const shelves = firstBay != null ? (draftShelvesByBay[firstBay] || []) : []; const rowKeys = Object.keys(draftRowLabels).map(Number).filter((k) => !Number.isNaN(k)).sort((a, b) => a - b); setFormError(""); setDeleteMode("bay"); setDeleteBayNumber(bayNumbers.length ? String(firstBay) : ""); setDeleteShelfBay(bayNumbers.length ? String(firstBay) : ""); setDeleteShelfLabel(shelves[0] ?? ""); setDeleteRowKey(rowKeys[0] != null ? String(rowKeys[0]) : ""); setDeleteModalOpen(true); }} className="inline-flex items-center justify-center rounded-xl border border-pink-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-pink-50 disabled:opacity-50 shadow-sm" disabled={bayNumbers.length === 0 && Object.keys(draftRowLabels || {}).length === 0} title="Delete bay, shelf, or rows">
                    Delete
                  </button>
                  <button type="button" onClick={handleSaveClick} disabled={!selectedProfile} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-400 to-sky-500 px-6 py-2.5 text-xs font-bold text-white hover:from-emerald-500 hover:to-sky-600 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Add Bay Modal */}
            <Modal open={addBayModalOpen} onClose={closeModal} title="Add bay">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Bay (number)</label>
                <input type="text" inputMode="numeric" value={addBayNumber} onChange={(e) => setAddBayNumber(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 7" className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>
              {formError && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>}
              <div className="mt-4 flex gap-2 justify-end">
                <button type="button" onClick={closeModal} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50">Cancel</button>
                <button type="button" onClick={() => { if (handleAddBay()) setAddBayModalOpen(false); }} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Add</button>
              </div>
            </Modal>

            {/* Add Shelf Modal */}
            <Modal open={addShelfModalOpen} onClose={closeModal} title="Add shelf">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Selected bay</label>
                  <select value={addShelfBay} onChange={(e) => setAddShelfBay(e.target.value)} className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="">Select bay</option>
                    {bayNumbers.map((b) => <option key={b} value={b}>B-{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Shelf (letter)</label>
                  <input type="text" value={addShelfLetters} onChange={(e) => setAddShelfLetters(e.target.value)} placeholder="e.g. A, B" className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>
              {formError && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>}
              <div className="mt-4 flex gap-2 justify-end">
                <button type="button" onClick={closeModal} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50">Cancel</button>
                <button type="button" onClick={() => { if (handleAddShelf()) setAddShelfModalOpen(false); }} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Add</button>
              </div>
            </Modal>

            {/* Add Rows Modal */}
            <Modal open={addRowsModalOpen} onClose={closeModal} title="Add rows">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Selected bay</label>
                  <select value={addRowsBay} onChange={(e) => { const b = parseInt(e.target.value, 10); setAddRowsBay(e.target.value); setAddRowsShelf((draftShelvesByBay[b] || [])[0] ?? ""); }} className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="">Select bay</option>
                    {bayNumbers.map((b) => <option key={b} value={b}>B-{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Selected shelf</label>
                  <select value={addRowsShelf} onChange={(e) => setAddRowsShelf(e.target.value)} className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    {(draftShelvesByBay[parseInt(addRowsBay, 10)] || []).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Rows</label>
                  <input type="text" value={addRowsInput} onChange={(e) => setAddRowsInput(e.target.value)} placeholder="e.g. 1, 2" className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" />
                </div>
              </div>
              {formError && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>}
              <div className="mt-4 flex gap-2 justify-end">
                <button type="button" onClick={closeModal} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50">Cancel</button>
                <button type="button" onClick={() => { if (handleAddRows()) setAddRowsModalOpen(false); }} className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Add</button>
              </div>
            </Modal>

            {/* Delete Modal */}
            <Modal open={deleteModalOpen} onClose={closeModal} title="Delete" borderColor="border-red-100">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">What do you want to delete?</label>
                  <select value={deleteMode} onChange={(e) => { setFormError(""); setDeleteMode(e.target.value); }} className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                    <option value="bay">Bay</option>
                    <option value="shelf">Shelf</option>
                    <option value="row">Row label</option>
                  </select>
                </div>
                {deleteMode === "bay" && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Select bay</label>
                    <select value={deleteBayNumber} onChange={(e) => setDeleteBayNumber(e.target.value)} className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option value="">Select bay</option>
                      {bayNumbers.map((b) => <option key={b} value={b}>B-{b}</option>)}
                    </select>
                  </div>
                )}
                {deleteMode === "shelf" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Select bay</label>
                      <select value={deleteShelfBay} onChange={(e) => { setDeleteShelfBay(e.target.value); const b = e.target.value === "" ? null : parseInt(e.target.value, 10); const shelves = b != null ? (draftShelvesByBay[b] || []) : []; setDeleteShelfLabel(shelves[0] ?? ""); }} className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="">Select bay</option>
                        {bayNumbers.map((b) => <option key={b} value={b}>B-{b}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Select shelf</label>
                      <select value={deleteShelfLabel} onChange={(e) => setDeleteShelfLabel(e.target.value)} className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                        <option value="">Select shelf</option>
                        {(draftShelvesByBay[parseInt(deleteShelfBay, 10)] || []).map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </>
                )}
                {deleteMode === "row" && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-700">Select row label</label>
                    <select value={deleteRowKey} onChange={(e) => setDeleteRowKey(e.target.value)} className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option value="">Select row</option>
                      {Object.keys(draftRowLabels || {}).map(Number).filter((k) => !Number.isNaN(k)).sort((a, b) => a - b).map((k) => <option key={k} value={k}>{draftRowLabels[k]}</option>)}
                    </select>
                  </div>
                )}
              </div>
              {formError && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>}
              <div className="mt-4 flex gap-2 justify-end">
                <button type="button" onClick={closeModal} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50">Cancel</button>
                <button type="button" onClick={() => { setFormError(""); setDeleteConfirmOpen(true); }} className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">Delete</button>
              </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} title="Confirm delete" borderColor="border-red-100">
              <p className="text-sm text-gray-700">Are you sure you want to delete <span className="font-semibold">{deleteSummary}</span>?</p>
              <p className="mt-2 text-[11px] text-gray-500">This updates the draft only. Use <span className="font-semibold">Save Changes</span> to persist.</p>
              {formError && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>}
              <div className="mt-4 flex gap-2 justify-end">
                <button type="button" onClick={() => setDeleteConfirmOpen(false)} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50">Cancel</button>
                <button type="button" onClick={() => { const ok = handleDeleteSubmit(); if (ok) { setDeleteConfirmOpen(false); setDeleteModalOpen(false); } }} className="inline-flex items-center justify-center rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">Confirm delete</button>
              </div>
            </Modal>

            {/* Save Confirm Modal */}
            <Modal open={saveConfirmOpen} onClose={() => setSaveConfirmOpen(false)} title="Confirm save changes" borderColor="border-emerald-100">
              <p className="text-sm text-gray-700">Are you sure you want to save changes to <span className="font-semibold">{selectedProfile?.name || "this location profile"}</span>?</p>
              <p className="mt-2 text-[11px] text-gray-500">This will permanently update the location profile. Any unsaved changes will be lost.</p>
              {formError && <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>}
              <div className="mt-4 flex gap-2 justify-end">
                <button type="button" onClick={() => setSaveConfirmOpen(false)} className="inline-flex items-center justify-center rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-emerald-50">Cancel</button>
                <button type="button" onClick={() => { const ok = handleSave(); if (ok) { setSaveConfirmOpen(false); } }} className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-xs font-semibold text-white hover:from-emerald-600 hover:to-sky-600">Confirm save</button>
              </div>
            </Modal>

            {!selectedProfile ? (
              <p className="text-sm text-gray-600">Select a profile to edit.</p>
            ) : formError && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{formError}</p>
            )}
          </div>

          {/* Editable Block Layout */}
          <div className="border-2 border-emerald-200/60 rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 p-5 md:p-6 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
                  Editable Block Layout
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {layoutView === "2d"
                    ? "Click on any bay header, shelf label, or row label to edit directly. Changes are saved to draft."
                    : "Interactive 3D model of the storage rack layout. Drag to rotate, scroll to zoom."}
                </p>
              </div>
              <div className="flex gap-0.5 bg-gray-100 rounded-xl p-0.5 shrink-0 ml-4">
                <button
                  type="button"
                  onClick={() => setLayoutView("2d")}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200 ${layoutView === "2d" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                >
                  2D Table
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutView("3d")}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all duration-200 ${layoutView === "3d" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                >
                  3D Model
                </button>
              </div>
            </div>
            {selectedProfile && layoutView === "3d" && (
              <LocationRack3D
                shelfLettersByBay={draftShelvesByBay}
                rowLabels={draftRowLabels}
                className="mt-2"
              />
            )}
            {selectedProfile && layoutView === "2d" && (
              <div className="overflow-x-auto w-full">
                <div className="border border-emerald-200 rounded-xl overflow-hidden inline-block min-w-full">
                  <table className="text-center text-sm border-collapse min-w-full">
                    <thead>
                      <tr className="bg-emerald-100/80 border-b border-emerald-200">
                        <th className="px-4 py-2 font-semibold text-emerald-800 border border-emerald-200 w-14 min-w-[3.5rem]" />
                        {bayNumbers.map((bay) => {
                          const isEditing = editingCell?.type === "bay" && editingCell?.bay === bay;
                          return (
                            <React.Fragment key={bay}>
                              <td className="w-6 p-0 border-none" aria-hidden />
                              <th colSpan={Math.max(1, Math.ceil((draftShelvesByBay[bay] || []).length / 2))} className="px-4 py-2 font-bold text-emerald-800 border-2 border-emerald-200/60 cursor-pointer hover:bg-gradient-to-r hover:from-emerald-100 hover:to-sky-100 transition-all duration-200" onClick={() => { setEditingCell({ type: "bay", bay }); setEditingValue(`B-${bay}`); }} title="Click to edit bay number">
                                {isEditing ? (
                                  <input type="text" value={editingValue} onChange={(e) => setEditingValue(e.target.value)} onBlur={() => commitBayEdit(bay)} onKeyDown={(e) => onKeyDown(e)} className="w-full text-center bg-white border-2 border-emerald-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-md" autoFocus />
                                ) : `B-${bay}`}
                              </th>
                            </React.Fragment>
                          );
                        })}
                        <td className="w-6 p-0 border-none" aria-hidden />
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1].map((blockIdx) => (
                        <React.Fragment key={blockIdx}>
                          <tr className="border-b border-emerald-200">
                            <td className="px-4 py-2 font-medium text-gray-700 bg-emerald-50/70 border border-emerald-200 w-14 min-w-[3.5rem]" />
                            {bayNumbers.map((bay) => {
                              const shelves = draftShelvesByBay[bay] || [];
                              const cols = Math.max(1, Math.ceil(shelves.length / 2));
                              const startIdx = blockIdx * cols;
                              const labels = shelves.slice(startIdx, startIdx + cols);
                              const padded = [...labels, ...Array(Math.max(0, cols - labels.length)).fill(null)];
                              return (
                                <React.Fragment key={bay}>
                                  <td className="w-6 p-0 border-none" aria-hidden />
                                  {padded.map((lbl, idx) => {
                                    const shelfIdx = startIdx + idx;
                                    const isEditing = editingCell?.type === "shelf" && editingCell?.bay === bay && editingCell?.shelfIndex === shelfIdx;
                                    return (
                                      <td key={`${bay}-${blockIdx}-${idx}`} className={`px-4 py-2 font-semibold text-gray-600 border-2 border-emerald-200/60 text-left min-w-[3rem] whitespace-nowrap w-14 transition-all duration-200 ${lbl ? "cursor-pointer hover:bg-gradient-to-r hover:from-emerald-50 hover:to-sky-50" : ""}`} onClick={() => { if (lbl) { setEditingCell({ type: "shelf", bay, shelfIndex: shelfIdx }); setEditingValue(lbl); } }} title={lbl ? "Click to edit shelf label" : ""}>
                                        {isEditing ? (
                                          <input type="text" value={editingValue} onChange={(e) => { const val = e.target.value.toUpperCase().trim(); setEditingValue(val.startsWith("S-") ? val : val ? `S-${val}` : val); }} onBlur={() => commitShelfEdit(bay, shelfIdx)} onKeyDown={(e) => onKeyDown(e)} className="w-full bg-white border-2 border-emerald-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-md" autoFocus />
                                        ) : (lbl ?? "")}
                                      </td>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                            <td className="w-6 p-0 border-none" aria-hidden />
                          </tr>
                          {Object.keys(draftRowLabels).map(Number).filter((k) => !Number.isNaN(k)).sort((a, b) => b - a).map((row) => {
                            const isEditing = editingCell?.type === "row" && editingCell?.rowKey === row;
                            return (
                              <tr key={`${blockIdx}-${row}`} className="border-b border-emerald-100">
                                <td className="px-4 py-2 font-semibold text-gray-600 bg-emerald-50/50 border-2 border-emerald-200/60 w-14 min-w-[3.5rem] whitespace-nowrap cursor-pointer hover:bg-gradient-to-r hover:from-emerald-100 hover:to-sky-100 transition-all duration-200" onClick={() => { setEditingCell({ type: "row", rowKey: row }); setEditingValue(draftRowLabels[row]); }} title="Click to edit row label">
                                  {isEditing ? (
                                    <input type="text" value={editingValue} onChange={(e) => { const val = e.target.value.toUpperCase().trim(); setEditingValue(val.startsWith("R-") ? val : val ? `R-${val}` : val); }} onBlur={() => commitRowEdit(row)} onKeyDown={(e) => onKeyDown(e)} className="w-full bg-white border-2 border-emerald-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 shadow-md" autoFocus />
                                  ) : draftRowLabels[row]}
                                </td>
                                {bayNumbers.map((bay) => {
                                  const cols = Math.max(1, Math.ceil((draftShelvesByBay[bay] || []).length / 2));
                                  return (
                                    <React.Fragment key={bay}>
                                      <td className="w-6 p-0 border-none" aria-hidden />
                                      {Array.from({ length: cols }, (_, ci) => (
                                        <td key={ci} className="px-3 py-2 border-2 min-w-[3rem] border-emerald-200 bg-white text-gray-400">—</td>
                                      ))}
                                    </React.Fragment>
                                  );
                                })}
                                <td className="w-6 p-0 border-none" aria-hidden />
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast variant="success" message={successMessage} onClose={() => setSuccessMessage("")} />
      <Toast variant="warning" message={warningMessage} onClose={() => setWarningMessage("")} />
    </>
  );
}
