import React from "react";

const ROW_ORDER = [6, 5, 4, 3, 2, 1]; // R-T(6), R-5(5), R-4(4), R-3(3), R-2(2), R-1(1)
const ROW_LABELS = { 1: "R-1", 2: "R-2", 3: "R-3", 4: "R-4", 5: "R-5", 6: "R-T" };
const COLS = 7;

const ACCENT_CLASSES = {
  emerald: "bg-emerald-600 text-white border-emerald-700",
  blue: "bg-sky-600 text-white border-sky-700",
  rose: "bg-rose-600 text-white border-rose-700",
  violet: "bg-violet-600 text-white border-violet-700",
};

const CELL_SIZE = "4rem"; // uniform square cells

/**
 * Shelf detail map: 7 columns x 6 rows (R-T to R-1).
 * Used as drill-down when clicking a highlighted box in the main map.
 */
export default function ShelfDetailMap({
  shelfLabel = "S-",
  resultRow,
  resultShelfColumn = 1,
  resultBoxNumber,
  accent = "emerald",
  onHighlightedCellClick,
}) {
  const accentClass = ACCENT_CLASSES[accent] || ACCENT_CLASSES.emerald;

  return (
    <div className="inline-block border border-emerald-200 rounded-xl overflow-hidden">
      <table className="border-collapse text-center text-[15px]">
        <thead>
          <tr>
            <td
              className="p-2 border border-emerald-200 bg-emerald-50/70"
              style={{ width: CELL_SIZE, minWidth: CELL_SIZE }}
            />
            <td
              colSpan={COLS}
              className="px-4 py-2 font-semibold text-emerald-800 border border-emerald-200 bg-emerald-100/80"
            >
              {shelfLabel}
            </td>
          </tr>
        </thead>
        <tbody>
          {ROW_ORDER.map((row) => (
            <tr key={row}>
              <td
                className="px-2 py-1.5 font-medium text-gray-600 bg-emerald-50/50 border border-emerald-200 whitespace-nowrap"
                style={{ width: CELL_SIZE, minWidth: CELL_SIZE }}
              >
                {ROW_LABELS[row]}
              </td>
              {Array.from({ length: COLS }, (_, i) => {
                const col = i + 1;
                const isMatch = resultRow === row && resultShelfColumn === col;
                const isClickable = isMatch && onHighlightedCellClick;
                return (
                  <td
                    key={col}
                    role={isClickable ? "button" : undefined}
                    tabIndex={isClickable ? 0 : undefined}
                    onClick={isClickable ? () => onHighlightedCellClick() : undefined}
                    onKeyDown={
                      isClickable
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onHighlightedCellClick();
                            }
                          }
                        : undefined
                    }
                    className={`border-2 box-border overflow-hidden ${
                      isMatch
                        ? `${accentClass} font-semibold`
                        : "border-emerald-200 bg-white text-gray-400"
                    } ${isClickable ? "cursor-pointer hover:opacity-90" : ""}`}
                    style={{
                      width: CELL_SIZE,
                      minWidth: CELL_SIZE,
                      height: CELL_SIZE,
                      minHeight: CELL_SIZE,
                    }}
                    title={isMatch ? (isClickable ? `Click to return to block layout — Box #${resultBoxNumber}` : `Box #${resultBoxNumber} located here`) : undefined}
                  >
                    {isMatch ? (
                      <span className="flex flex-col leading-tight text-[12px]">
                        <span>Box</span>
                        <span>#{resultBoxNumber}</span>
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
