import React from "react";

/**
 * Consistent uppercase tracking label used across all forms.
 */
export default function Label({ children, disabled, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-[11px] font-semibold tracking-[0.18em] uppercase ${
        disabled ? "text-gray-400" : "text-gray-700"
      }`}
    >
      {children}
    </label>
  );
}
