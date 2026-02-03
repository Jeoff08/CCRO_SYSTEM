import React from "react";

const COLORS = {
  COLB: "bg-blue-600 text-white",
  COM: "bg-red-600 text-white",
  COD: "bg-purple-600 text-white",
};

const LABELS = {
  COLB: "Birth Certificate",
  COM: "Marriage Certificate",
  COD: "Death Certificate",
};

export default function CertificateBadge({ type, compact }) {
  if (!type) return null;
  const color = COLORS[type] || "bg-gray-600 text-white";
  const label = LABELS[type] || type;

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

