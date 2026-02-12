import React, { useEffect, useMemo, useRef } from "react";

const ACCENT_STYLES = {
  emerald: {
    highlightBg: "bg-emerald-600",
    highlightBorder: "border-emerald-700",
    highlightRing: "ring-emerald-400",
  },
  blue: {
    highlightBg: "bg-sky-600",
    highlightBorder: "border-sky-700",
    highlightRing: "ring-sky-400",
  },
  rose: {
    highlightBg: "bg-rose-600",
    highlightBorder: "border-rose-700",
    highlightRing: "ring-rose-400",
  },
  violet: {
    highlightBg: "bg-violet-600",
    highlightBorder: "border-violet-700",
    highlightRing: "ring-violet-400",
  },
};

export default function LocationResultLayout({
  result,
  matchingBox,
  shelfLettersByBay,
  rowLabels,
  title = "Location result",
  isPreview = false,
  accent = "emerald",
}) {
  const matchCellRef = useRef(null);

  useEffect(() => {
    if (result && matchCellRef.current && !isPreview) {
      matchCellRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    }
  }, [result, isPreview]);

  if (!result && !isPreview) return null;

  const hasResult = !!result;
  const resultBay = hasResult ? (matchingBox ? matchingBox.bay : result.bay) : null;
  const resultShelf = hasResult ? (matchingBox ? matchingBox.shelf : result.shelf) : null;
  const resultRow = hasResult ? (matchingBox ? matchingBox.row : result.row) : null;
  const resultBox = hasResult ? (matchingBox ? matchingBox.boxNumber : result.box) : null;
  const shelfLabel = hasResult
    ? shelfLettersByBay[resultBay]?.[resultShelf - 1] || `S-${resultShelf}`
    : null;
  const rowLabel = hasResult ? rowLabels[resultRow] || `R-${resultRow}` : null;
  const headingSuffix = matchingBox ? " (from registered box)" : " (computed)";
  const noteSuffix = matchingBox ? " Values from registered box." : "";
  const accentStyles = ACCENT_STYLES[accent] || ACCENT_STYLES.emerald;

  const bays = useMemo(() => {
    const keys = Object.keys(shelfLettersByBay || {})
      .map(Number)
      .filter((k) => !Number.isNaN(k))
      .sort((a, b) => a - b);
    return keys.length ? keys : [1, 2, 3, 4, 5, 6];
  }, [shelfLettersByBay]);

  const rowOrder = useMemo(() => {
    const keys = Object.keys(rowLabels || {})
      .map(Number)
      .filter((k) => !Number.isNaN(k))
      .sort((a, b) => b - a);
    return keys.length ? keys : [6, 5, 4, 3, 2, 1];
  }, [rowLabels]);

  const colsPerBay = (b) => {
    const shelves = shelfLettersByBay[b] || [];
    return Math.max(1, Math.ceil(shelves.length / 2));
  };

  const getShelfForCell = (bay, block, colInBlock) => {
    const cols = colsPerBay(bay);
    return block * cols + colInBlock + 1;
  };

  const blocks = [
    { label: "S-A", shelfIndices: [0, 1] },
    { label: "S-B", shelfIndices: [2, 3] },
  ];

  const SpacerCell = () => <td className="w-6 p-0 border-none" aria-hidden />;

  return (
    <div className="mt-2 border border-emerald-100 rounded-2xl p-4 md:p-5 bg-emerald-50/60 overflow-hidden">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {title}
        {hasResult && !isPreview && headingSuffix}
      </h3>

      {hasResult && (
        <>
          <div className="mb-4 p-4 rounded-xl bg-white border-2 border-emerald-200">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700 mb-2">
              Where the document is located
            </p>
            <p className="text-base font-semibold text-gray-900">
              Bay {resultBay} → Shelf {shelfLabel} → Row {rowLabel} → Box #{resultBox}
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Go to Bay {resultBay}, find Shelf {shelfLabel}, then Row {rowLabel}. The document is in Box #{resultBox}.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[max-content]">
              <thead>
                <tr className="border-b border-emerald-200 bg-emerald-50/70">
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Document / file location</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Bay#</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Shelf</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Row / Level</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Box#</th>
                  <th className="px-3 py-2 font-semibold text-gray-600 whitespace-nowrap">Search Code</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-3 py-2 text-gray-900 border-b border-emerald-50 font-medium">
                    {`Bay ${resultBay} → Shelf ${shelfLabel} → Row ${rowLabel} → Box #${resultBox}`}
                  </td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap border-b border-emerald-50">{resultBay}</td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap border-b border-emerald-50">{shelfLabel}</td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap border-b border-emerald-50">{rowLabel}</td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap border-b border-emerald-50">{resultBox}</td>
                  <td className="px-3 py-2 text-gray-900 whitespace-nowrap border-b border-emerald-50 font-mono text-xs">{result.searchCode}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      <h4 className="text-xs font-semibold text-gray-700 mt-4 mb-2">
        {hasResult
          ? `Block layout — document located at Bay ${resultBay}, Shelf ${shelfLabel}, Row ${rowLabel}`
          : "Block layout preview"}
      </h4>
      <div className="overflow-x-auto w-full">
        <div className="border border-emerald-200 rounded-xl overflow-hidden inline-block min-w-full">
          <table className="text-center text-sm border-collapse min-w-full">
            <thead>
              <tr className="bg-emerald-100/80 border-b border-emerald-200">
                <th className="px-4 py-2 font-semibold text-emerald-800 border border-emerald-200 w-14 min-w-[3.5rem]" />
                {bays.map((bay) => (
                  <React.Fragment key={bay}>
                    <SpacerCell />
                    <th colSpan={colsPerBay(bay)} className="px-4 py-2 font-semibold text-emerald-800 border border-emerald-200">
                      B-{bay}
                    </th>
                  </React.Fragment>
                ))}
                <SpacerCell />
              </tr>
            </thead>
            <tbody>
              {blocks.map((block, blockIdx) => (
                <React.Fragment key={block.label}>
                  <tr className="border-b border-emerald-200">
                    <td className="px-4 py-2 font-medium text-gray-700 bg-emerald-50/70 border border-emerald-200 w-14 min-w-[3.5rem]" />
                    {bays.map((bay) => {
                      const n = colsPerBay(bay);
                      const allLabels = shelfLettersByBay[bay] || [];
                      const labels = allLabels.slice(blockIdx * n, (blockIdx + 1) * n);
                      const padded = [...labels, ...Array(Math.max(0, n - labels.length)).fill(null)];
                      return (
                        <React.Fragment key={bay}>
                          <SpacerCell />
                          {padded.map((lbl, idx) => (
                            <td
                              key={`${bay}-${blockIdx}-${idx}`}
                              className="px-4 py-2 font-medium text-gray-600 border border-emerald-200 text-left min-w-[3rem] whitespace-nowrap w-14"
                            >
                              {lbl ?? ""}
                            </td>
                          ))}
                        </React.Fragment>
                      );
                    })}
                    <SpacerCell />
                  </tr>
                  {rowOrder.map((row) => (
                    <tr key={`${block.label}-${row}`} className="border-b border-emerald-100">
                      <td className="px-4 py-2 font-medium text-gray-600 bg-emerald-50/50 border border-emerald-200 w-14 min-w-[3.5rem] whitespace-nowrap">
                        {rowLabels[row]}
                      </td>
                      {bays.map((bay) => {
                        const n = colsPerBay(bay);
                        return (
                          <React.Fragment key={bay}>
                            <SpacerCell />
                            {Array.from({ length: n }, (_, ci) => {
                              const shelf = getShelfForCell(bay, blockIdx, ci);
                              const shelfLbl = shelfLettersByBay[bay]?.[shelf - 1] || `S-${shelf}`;
                              const rowLbl = rowLabels[row] || `R-${row}`;
                              const cellLocation = `Bay ${bay}, Shelf ${shelfLbl}, Row ${rowLbl}`;
                              const isMatch = hasResult && resultBay === bay && resultShelf === shelf && resultRow === row;
                              return (
                                <td
                                  key={ci}
                                  ref={isMatch ? matchCellRef : null}
                                  className={`px-3 py-2 border-2 min-w-[3rem] ${
                                    isMatch
                                      ? `${accentStyles.highlightBg} text-white font-semibold ${accentStyles.highlightBorder} ring-2 ${accentStyles.highlightRing} ring-offset-1`
                                      : "border-emerald-200 bg-white text-gray-400"
                                  }`}
                                  title={isMatch ? `Document located here: ${cellLocation} — Box #${resultBox}` : cellLocation}
                                >
                                  {isMatch ? `Box# ${resultBox} ✓` : "—"}
                                </td>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                      <SpacerCell />
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-gray-600">
        Use this table to locate your document in physical storage. The highlighted cell shows Bay, Shelf, and Row. Hover any cell to see its location.
        {hasResult && !isPreview && noteSuffix}
      </p>
    </div>
  );
}
