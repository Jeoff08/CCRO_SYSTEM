export { formatActivityType, formatActivityTimestamp } from "./formatting.js";

export {
  getShelfLetter,
  getShelfNumberFromLetter,
  buildSearchCode,
  normalizeShelvesInput,
  validateShelvesByBay,
} from "./location.js";

export { parseRegistryRange } from "./registry.js";

/**
 * Generate a unique ID (UUID v4) with fallback.
 */
export function makeId() {
  try {
    return (
      crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`
    );
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}
