import React from "react";
import type { SaveStatus } from "../../hooks/useAutoSave";

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;

  return (
    <div className={`
      fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all duration-300
      ${status === "saving" ? "bg-blue-50 text-blue-700 translate-y-0 opacity-100" : ""}
      ${status === "saved" ? "bg-green-50 text-green-700 translate-y-0 opacity-100" : ""}
    `}>
      {status === "saving" && (
        <>
          <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Enregistrement...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Sauvegardé</span>
        </>
      )}
    </div>
  );
}
