import React from "react";

export default function ActivityLog({ activityLog }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
        <p className="text-sm text-gray-600">
          Searches, logins, and box changes are captured here for accountability
          and audits.
        </p>
      </div>

      <div className="border border-emerald-100 rounded-2xl bg-emerald-50/60 p-4 max-h-[32rem] overflow-y-auto custom-scrollbar">
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
                    : entry.details.message}
                </p>
                {typeof entry.details === "object" &&
                  entry.details.searchCode && (
                    <p className="font-mono text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-lg px-2 py-1 mt-0.5">
                      {entry.details.searchCode}
                    </p>
                  )}
              </li>
            ))}
          </ul>
        )}
      </div>
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
    default:
      return type;
  }
}

function formatTimestamp(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

