import React from "react";
import Label from "./Label.jsx";

/**
 * Consistent label + input wrapper used in forms.
 */
export default function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
