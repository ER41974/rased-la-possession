import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, className = "", id, ...props }: InputProps) {
  const inputId = id || React.useId();

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm
          outline-none transition-all
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          placeholder:text-gray-400
          disabled:bg-gray-50 disabled:text-gray-500
          ${error ? "border-red-500 focus:ring-red-100" : "border-gray-200"}
          ${className}
        `}
        {...props}
      />
      {hint && !error && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function TextArea({ label, error, hint, className = "", id, ...props }: TextAreaProps) {
  const inputId = id || React.useId();

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm
          outline-none transition-all
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          placeholder:text-gray-400
          ${error ? "border-red-500 focus:ring-red-100" : "border-gray-200"}
          ${className}
        `}
        {...props}
      />
      {hint && !error && <div className="mt-1 text-xs text-gray-500">{hint}</div>}
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export function Select({ label, error, options, children, className = "", id, ...props }: SelectProps) {
  const inputId = id || React.useId();

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label} {props.required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={`
            w-full appearance-none rounded-lg border bg-white px-3 py-2 text-sm
            outline-none transition-all
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100
            disabled:bg-gray-50
            ${error ? "border-red-500 focus:ring-red-100" : "border-gray-200"}
            ${className}
          `}
          {...props}
        >
          {options ? options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )) : children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
    </div>
  );
}
