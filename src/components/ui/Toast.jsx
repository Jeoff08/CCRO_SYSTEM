import React from "react";

/**
 * Fixed-position toast notification.
 * @param {"success"|"warning"|"error"} variant
 * @param {string} message
 * @param {function} onClose
 */
export default function Toast({ variant = "success", message, onClose }) {
  if (!message) return null;

  const styles = {
    success: {
      bg: "bg-white",
      border: "border-emerald-400",
      shadow: "shadow-emerald-500/30",
      icon: (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      ),
      text: "text-gray-900",
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-500 to-orange-500",
      border: "border-amber-400/50",
      shadow: "shadow-amber-500/30",
      icon: (
        <svg
          className="w-6 h-6 text-white flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M12 9v2m0 4h.01M10.29 3.86l-8.4 14.31A1.73 1.73 0 003.42 21h17.16a1.73 1.73 0 001.53-2.83l-8.4-14.31a1.73 1.73 0 00-3.02 0z"
          />
        </svg>
      ),
      text: "text-white",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-400",
      shadow: "shadow-red-500/30",
      icon: (
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      ),
      text: "text-red-900",
    },
  };

  const s = styles[variant] || styles.success;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-top-2 fade-in duration-300">
      <div
        className={`${s.bg} rounded-xl border-2 ${s.border} shadow-2xl ${s.shadow} px-5 py-4 min-w-[280px] max-w-md flex items-center gap-3`}
      >
        {s.icon}
        <p className={`flex-1 text-sm font-semibold ${s.text}`}>{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-lg hover:bg-black/10 transition-colors"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
