import React, { useMemo, useState, useRef, useEffect } from "react";
import { Label } from "../ui/index.js";

export default function YearCombobox({
  year,
  setYear,
  availableYears,
  disabled,
  placeholder,
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const filtered = useMemo(() => {
    if (!year) return availableYears;
    return availableYears.filter((y) => String(y).includes(year));
  }, [availableYears, year]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <Label disabled={disabled}>Year</Label>
      <input
        type="text"
        inputMode="numeric"
        value={year}
        onChange={(e) => {
          const value = e.target.value.replace(/[^\d]/g, "");
          setYear(value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-xl border-0 bg-white px-4 py-3 text-sm font-medium text-gray-900 disabled:bg-gray-50/80 disabled:text-gray-400 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 transition-all duration-200 shadow-sm hover:shadow-md"
      />
      {open && !disabled && filtered.length > 0 && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-lg py-1">
          {filtered.map((y) => (
            <li
              key={y}
              onMouseDown={(e) => {
                e.preventDefault();
                setYear(String(y));
                setOpen(false);
              }}
              className="px-4 py-2 text-sm text-gray-900 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
            >
              {y}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
