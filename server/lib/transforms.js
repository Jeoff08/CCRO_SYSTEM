/**
 * Transform a box row from snake_case DB columns to camelCase JS.
 */
export function transformBox(box) {
  if (!box) return null;
  return {
    id: box.id,
    certificateType: box.certificate_type,
    year: box.year,
    yearTo: box.year_to,
    monthIndex: box.month_index,
    monthIndexTo: box.month_index_to,
    boxNumber: box.box_number,
    bay: box.bay,
    shelf: box.shelf,
    row: box.row,
    registryRange: box.registry_range,
    remark: box.remark,
    createdAt: box.created_at,
    updatedAt: box.updated_at,
  };
}

/**
 * Transform a location profile row, parsing JSON columns.
 */
export function transformProfile(profile) {
  if (!profile) return null;
  return {
    ...profile,
    shelfLettersByBay: JSON.parse(profile.shelf_letters_by_bay),
    rowLabels: JSON.parse(profile.row_labels),
    isActive: profile.is_active === 1,
  };
}

/**
 * Parse activity log details (may be JSON string or plain string).
 */
export function parseLogDetails(details) {
  if (typeof details !== "string") return details;
  try {
    return JSON.parse(details);
  } catch {
    return details;
  }
}
