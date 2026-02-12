/**
 * Format an activity log type into a human-readable label.
 */
export function formatActivityType(type) {
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

/**
 * Format an ISO timestamp for display in the Philippine timezone.
 * SQLite datetime('now') stores UTC without a Z suffix, so we append it
 * if missing so JS can correctly convert to PH time.
 */
export function formatActivityTimestamp(iso) {
  const raw =
    typeof iso === "string" && !iso.endsWith("Z") && !iso.includes("+")
      ? iso + "Z"
      : iso;
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
