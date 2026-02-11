import React from "react";

export default function ActivityLog({ activityLog, onLogout, onClearHistory }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
          <p className="text-sm text-gray-600">
            Searches, logins, and box changes are captured here for accountability
            and audits.
          </p>
        </div>
        {activityLog.length > 0 && onClearHistory && (
          <button
            type="button"
            onClick={onClearHistory}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white border-2 border-emerald-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
            title="Clear all activity logs"
          >
            Clear History
          </button>
        )}
      </div>

      <div className="border border-emerald-100 rounded-2xl bg-emerald-50/60 p-4 md:p-5 max-h-[28rem] overflow-y-auto custom-scrollbar">
          {activityLog.length === 0 ? (
            <p className="text-xs text-gray-500">
              No activity recorded yet. Actions performed in the locator and box
              modules will appear here.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {activityLog.map((entry) => (
                <li
                  key={entry.id}
                  className="bg-white border border-emerald-100 rounded-xl px-3 py-2.5 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                      {formatType(entry.type)}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-800">
                    {typeof entry.details === "string"
                      ? entry.details
                      : entry.details?.message || entry.details || ""}
                  </p>
                  {(entry.searchCode || (typeof entry.details === "object" && entry.details?.searchCode)) && (
                    <p className="font-mono text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 mt-0.5">
                      {entry.searchCode || entry.details?.searchCode}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
      </div>

      {onLogout && (
        <div className="mt-6 pt-4 border-t-2 border-emerald-200 flex justify-end">
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 transition"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function formatType(type) {
  switch (type) {
    case "login":
      return "User Login";
    case "logout":
      return "User Logout";
    case "search":
      return "Search Executed";
    case "box-add":
      return "Box Created";
    case "box-edit":
      return "Box Edited";
    case "box-delete":
      return "Box Deleted";
    default:
      return type;
  }
}

function formatTimestamp(iso) {
  // SQLite datetime('now') stores UTC without a Z suffix,
  // so append Z if missing so JS knows it's UTC before converting to PH time.
  const raw = typeof iso === "string" && !iso.endsWith("Z") && !iso.includes("+") ? iso + "Z" : iso;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

