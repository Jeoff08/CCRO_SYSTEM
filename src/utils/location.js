import { certCodeForSearch } from "../constants/certificates.js";

/**
 * Look up the shelf label string for a given bay + shelf number.
 * @param {Object} shelfLettersByBay - map of bay → shelf label array
 * @param {number} bay
 * @param {number} shelfNumber - 1-based shelf index
 */
export function getShelfLetter(shelfLettersByBay, bay, shelfNumber) {
  return shelfLettersByBay[bay]?.[shelfNumber - 1] || `S-${shelfNumber}`;
}

/**
 * Reverse lookup: given a shelf label ("S-A"), get the 1-based shelf number.
 */
export function getShelfNumberFromLetter(shelfLettersByBay, bay, letter) {
  const mapping = shelfLettersByBay[bay];
  if (!mapping) return null;
  const index = mapping.findIndex((l) => l === letter);
  return index >= 0 ? index + 1 : null;
}

/**
 * Build a search code string from a registered box's data.
 */
export function buildSearchCode({
  certificateType,
  year,
  bay,
  shelf,
  row,
  boxNumber,
  shelfLettersByBay,
  rowLabels,
}) {
  const shelfLabel = shelfLettersByBay[bay]?.[shelf - 1] || `S-${shelf}`;
  const rowLabel = rowLabels[row] || `R-${row}`;
  return [
    certCodeForSearch(certificateType),
    `Y-${year}`,
    `B-${bay}`,
    shelfLabel,
    rowLabel,
    `B-${boxNumber}`,
  ].join(";");
}

/**
 * Normalize raw shelf input text ("A, B, C") into canonical labels ["S-A", "S-B", "S-C"].
 */
export function normalizeShelvesInput(value) {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.startsWith("S-") ? s : `S-${s}`))
    .map((s) => s.toUpperCase());
}

/**
 * Validate that every bay has the correct number of shelves and proper format.
 */
export function validateShelvesByBay(shelfLettersByBay) {
  const errors = [];
  const bays = [1, 2, 3, 4, 5, 6];
  for (const bay of bays) {
    const shelves = shelfLettersByBay[bay] || [];
    const expected = bay === 1 || bay === 6 ? 2 : 4;
    if (shelves.length !== expected) {
      errors.push(`Bay ${bay} must have exactly ${expected} shelf letters.`);
    }
    const unique = new Set(shelves);
    if (unique.size !== shelves.length) {
      errors.push(`Bay ${bay} shelf letters must be unique.`);
    }
    for (const s of shelves) {
      if (!/^S-[A-Z]$/.test(s)) {
        errors.push(
          `Bay ${bay} has invalid shelf label "${s}". Use format like S-A.`
        );
      }
    }
  }
  return errors;
}
