import React from "react";
import { formatActivityType, formatActivityTimestamp } from "../../utils/index.js";

export default function DashboardHome({ activityLog, boxes, clearHistory }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Recent events and activity across the archive system.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 p-5 md:p-6 shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="bg-white rounded-2xl px-5 py-4 shadow-md hover:shadow-lg hover:border-emerald-300 transition-all duration-300 group">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Registered Boxes</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-sky-700 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                  {boxes.length}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="rounded-3xl bg-gradient-to-br from-white via-emerald-50/30 to-sky-50/20 p-5 md:p-6 max-h-[28rem] overflow-y-auto custom-scrollbar shadow-lg shadow-emerald-100/50 hover:shadow-xl hover:shadow-emerald-200/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
                Activity Log
              </h3>
              {activityLog.length > 0 && clearHistory && (
                <button
                  type="button"
                  onClick={clearHistory}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white shadow-md rounded-lg hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200"
                  title="Clear all activity logs"
                >
                  Clear History
                </button>
              )}
            </div>
            {activityLog.length === 0 ? (
              <p className="text-xs text-gray-500">
                No activity recorded yet. Actions performed in the locator and box modules will appear here.
              </p>
            ) : (
              <ul className="space-y-2 text-xs">
                {activityLog.map((entry) => (
                  <li
                    key={entry.id}
                    className="bg-white rounded-2xl px-4 py-3 flex flex-col gap-2 shadow-sm hover:shadow-lg hover:border-emerald-300 hover:-translate-y-0.5 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                        {formatActivityType(entry.type)}
                      </span>
                      <span className="text-[10px] text-gray-500">
                        {formatActivityTimestamp(entry.timestamp)}
                      </span>
                    </div>
                    <p className="text-gray-800">
                      {typeof entry.details === "string"
                        ? entry.details
                        : entry.details?.message ?? entry.details ?? ""}
                    </p>
                    {(entry.searchCode ||
                      (typeof entry.details === "object" && entry.details?.searchCode)) && (
                      <p className="font-mono text-[11px] text-emerald-800 bg-gradient-to-r from-emerald-50 to-sky-50 border-2 border-emerald-200/50 rounded-lg px-3 py-1.5 mt-1 shadow-sm group-hover:shadow-md transition-all duration-300">
                        {entry.searchCode || entry.details?.searchCode}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
