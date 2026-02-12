import React from "react";

/**
 * Reusable modal overlay with centered content panel.
 * @param {boolean} open   - whether to render the modal
 * @param {function} onClose - called when clicking the backdrop or close button
 * @param {string} title   - header text
 * @param {string} maxWidth - tailwind max-w class (default "max-w-md")
 * @param {string} borderColor - border accent (default "border-emerald-100")
 */
export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  borderColor = "border-emerald-100",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`bg-white rounded-3xl border-2 ${borderColor} shadow-2xl ${maxWidth} w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="p-5 md:p-6 border-b border-emerald-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-500 hover:bg-emerald-50 hover:text-gray-700"
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
        )}
        <div className="p-5 md:p-6">{children}</div>
      </div>
    </div>
  );
}
