/**
 * Parse a registry range string like "0001–0100", "1-100", "0001 - 0100"
 * into { start, end } as numbers, or null if unparseable.
 */
export function parseRegistryRange(rangeStr) {
  if (!rangeStr) return null;
  // Support en-dash, em-dash, hyphen, with optional spaces
  const match = rangeStr
    .trim()
    .match(/^(\d+)\s*[\u2013\u2014\-–—]\s*(\d+)$/);
  if (!match) return null;
  return { start: Number(match[1]), end: Number(match[2]) };
}
