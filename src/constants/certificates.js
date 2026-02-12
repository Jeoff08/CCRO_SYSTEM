/** Certificate type definitions used across the app. */
export const CERT_TYPES = [
  { code: "COLB", label: "Birth (COLB)" },
  { code: "COM", label: "Marriage (COM)" },
  { code: "COD", label: "Death (COD)" },
];

/** Full human-readable labels keyed by code. */
export const CERT_LABELS = {
  COLB: "Birth Certificate",
  COM: "Marriage Certificate",
  COD: "Death Certificate",
};

/** Badge color classes keyed by code. */
export const CERT_COLORS = {
  COLB: "bg-blue-600 text-white",
  COM: "bg-red-600 text-white",
  COD: "bg-purple-600 text-white",
};

/** Short code used in search code strings. */
export function certCodeForSearch(type) {
  switch (type) {
    case "COLB":
      return "COB";
    case "COM":
      return "COM";
    case "COD":
      return "COD";
    default:
      return type;
  }
}
