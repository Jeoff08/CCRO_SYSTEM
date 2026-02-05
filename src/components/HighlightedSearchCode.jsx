import React from "react";

const BOX_STYLES = {
  COM: "bg-red-600",
  COLB: "bg-blue-600",
  COB: "bg-blue-600",
  COD: "bg-purple-600",
};

/** Wraps the full search code in a colored box based on certificate type: COM (red), COLB/COB (blue), COD (purple) */
export default function HighlightedSearchCode({ code, className = "" }) {
  if (!code || typeof code !== "string") return null;

  const firstSegment = code.split(";")[0]?.trim() || "";
  const bgClass = BOX_STYLES[firstSegment] || "bg-gray-600";

  return (
    <span
      className={`inline-block font-mono text-[15px] font-semibold text-white px-2 py-1 rounded ${bgClass} ${className}`}
    >
      {code}
    </span>
  );
}
