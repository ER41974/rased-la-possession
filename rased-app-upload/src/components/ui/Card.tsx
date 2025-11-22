import React from "react";

export function Card({ children, className = "", title }: { children: React.ReactNode; className?: string, title?: string }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md ${className}`}>
      {title && (
        <div className="border-b border-gray-50 bg-gray-50/50 px-6 py-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6 md:p-8">
        {children}
      </div>
    </div>
  );
}
