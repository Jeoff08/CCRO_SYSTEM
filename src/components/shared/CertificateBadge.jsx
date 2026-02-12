import React from "react";
import { CERT_LABELS, CERT_COLORS } from "../../constants/index.js";

export default function CertificateBadge({ type, compact }) {
  if (!type) return null;
  const color = CERT_COLORS[type] || "bg-gray-600 text-white";
  const label = CERT_LABELS[type] || type;

  if (compact) {
    return (
      <span
        className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-semibold text-white ${color}`}
      >
        {type}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium text-white ${color}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-white/80" />
      {label} ({type})
    </span>
  );
}
