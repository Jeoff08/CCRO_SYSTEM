export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CURRENT_YEAR = new Date().getFullYear();

/** Array of years from 1944 to current year (used in dropdowns). */
export const YEARS = Array.from(
  { length: CURRENT_YEAR - 1944 + 1 },
  (_, i) => 1944 + i
);
