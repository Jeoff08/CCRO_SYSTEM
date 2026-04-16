import React, { useRef, useState } from "react";
import { Modal, Toast } from "../ui/index.js";
import { boxesAPI } from "../../api/index.js";

export default function Backup({
  boxes,
  onRefresh,
  mode = "all",
}) {
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [exportingDb, setExportingDb] = useState(false);
  const [importingDb, setImportingDb] = useState(false);
  const [confirmImportDbOpen, setConfirmImportDbOpen] = useState(false);
  const [pendingImportDbFile, setPendingImportDbFile] = useState(null);
  const dbFileInputRef = useRef(null);

  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        resolve(dataUrl.replace(/^data:[^;]*;base64,/, ""));
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const handleExportDbClick = async () => {
    setExportingDb(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const blob = await boxesAPI.exportDb();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ccro-box-management_${new Date().toISOString().slice(0, 19).replace(/[-:T]/g, "")}.db`;
      a.click();
      URL.revokeObjectURL(url);
      setSuccessMessage("Box management (boxes and personnel) exported as .db file.");
    } catch (err) {
      setErrorMessage(err?.message || "Export failed.");
    } finally {
      setExportingDb(false);
    }
  };

  const handleImportDbClick = () => {
    if (dbFileInputRef.current) dbFileInputRef.current.click();
  };

  const handleImportDbFileChange = (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    e.target.value = "";
    if (!file.name.toLowerCase().endsWith(".db")) {
      setErrorMessage("Please select a .db file (Box management export).");
      return;
    }
    setPendingImportDbFile(file);
    setConfirmImportDbOpen(true);
  };

  const handleConfirmImportDb = async () => {
    if (!pendingImportDbFile) return;
    const file = pendingImportDbFile;
    setConfirmImportDbOpen(false);
    setPendingImportDbFile(null);
    setImportingDb(true);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      const base64 = await readFileAsBase64(file);
      const result = await boxesAPI.importDb(base64);
      if (onRefresh) await onRefresh();
      const importedBoxes = result?.importedBoxes ?? result?.imported ?? 0;
      const importedPersonnel = result?.importedPersonnel ?? 0;
      setSuccessMessage(
        result?.message ||
          `Imported ${importedBoxes} box(es) and ${importedPersonnel} personnel record(s) into Box management.`
      );
    } catch (err) {
      setErrorMessage(err?.message || "Import failed.");
    } finally {
      setImportingDb(false);
    }
  };

  return (
    <div className="space-y-6">
      <Toast
        variant="success"
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
      <Toast
        variant="error"
        message={errorMessage}
        onClose={() => setErrorMessage(null)}
      />

      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
          {mode === "export" ? "Export" : mode === "import" ? "Import" : "Backup"}
        </h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {mode === "export" && "Export Box management (boxes and personnel) as a .db file."}
          {mode === "import" && "Import Box management (boxes and personnel) from a .db file."}
          {mode !== "export" &&
            mode !== "import" &&
            "Export and import Box management (boxes and personnel) as .db files."}
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {mode !== "import" && (
          <button
            type="button"
            onClick={handleExportDbClick}
            disabled={boxes.length === 0 || exportingDb}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-600 px-5 py-3 text-sm font-bold text-white hover:bg-slate-700 shadow-md shadow-slate-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exportingDb ? "Exporting…" : "Export .db (Box management)"}
          </button>
        )}
        {mode !== "export" && (
          <button
            type="button"
            onClick={handleImportDbClick}
            disabled={importingDb}
            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-600 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {importingDb ? "Importing…" : "Import .db (Box management)"}
            </button>
        )}
      </div>

      <input
        ref={dbFileInputRef}
        type="file"
        accept=".db"
        onChange={handleImportDbFileChange}
        className="hidden"
      />

      {/* Import .db (Box management) confirmation modal */}
      <Modal
        open={confirmImportDbOpen}
        onClose={() => { setConfirmImportDbOpen(false); setPendingImportDbFile(null); }}
        title="Import .db (Box management)"
        maxWidth="max-w-md"
        borderColor="border-slate-200"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Import Box management from <strong>{pendingImportDbFile?.name}</strong>? This will{" "}
            <strong>replace all current registered boxes and personnel</strong> with the data from the file.
          </p>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-xs font-semibold text-amber-800 mb-1">Warning</p>
            <p className="text-xs text-amber-800/90">
              The <strong>boxes</strong> and <strong>personnel</strong> tables are imported. All existing registered
              boxes and personnel will be removed and replaced by the contents of this .db file. Use a file that was
              exported with &ldquo;Export .db (Box management)&rdquo;.
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => { setConfirmImportDbOpen(false); setPendingImportDbFile(null); }}
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImportDb}
              className="inline-flex items-center justify-center rounded-xl bg-slate-600 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
            >
              Import
            </button>
          </div>
        </div>
      </Modal>

      <div className="rounded-2xl border border-slate-200/60 bg-slate-50/30 p-4 text-sm text-gray-600">
        <p className="font-semibold text-gray-700 mb-1">.db (Box management)</p>
        <p>
          Exports or imports the registered <strong>boxes</strong> and <strong>personnel</strong> tables as a SQLite
          file. No users, location profiles, activity logs, or checkouts are included. Use a file that was exported
          with &ldquo;Export .db (Box management)&rdquo; for import.
        </p>
      </div>
    </div>
  );
}
