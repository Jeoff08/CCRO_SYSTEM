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
 * Transform a personnel row from snake_case DB columns to camelCase JS.
 */
export function transformPersonnel(row) {
  if (!row) return null;
  return {
    id: row.id,
    personnelId: row.personnel_id,
    fullName: row.full_name,
    createdAt: row.created_at,
  };
}

/**
 * Transform a checkout row from snake_case DB columns to camelCase JS.
 */
export function transformCheckout(row) {
  if (!row) return null;
  return {
    id: row.id,
    personnelId: row.personnel_id,
    personnelName: row.personnel_name,
    boxId: row.box_id,
    certType: row.cert_type,
    registryRange: row.registry_range,
    monthStr: row.month_str,
    yearStr: row.year_str,
    checkoutDate: row.checkout_date,
    checkoutTime: row.checkout_time,
    returnedAt: row.returned_at,
    createdAt: row.created_at,
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

/**
 * Convert activity log details to a display-safe string (avoids React "Objects are not valid as a React child").
 */
export function detailsToDisplayString(details) {
  if (details == null) return "";
  if (typeof details === "string") return details;
  if (typeof details === "object") {
    if (details.message) return details.message;
    if (details.boxId != null && details.personnelId != null) {
      return `Box ${details.boxId} checked out by ${details.personnelId}`;
    }
    if (details.checkoutId != null) return `Checkout ${details.checkoutId} returned`;
    return JSON.stringify(details);
  }
  return String(details);
}
