import React from "react";
export function Modal({ isOpen, title, children, onClose, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 flex gap-2 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Card({ children, title, subtitle, className = "" }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-slate-100">
          {title && <h3 className="font-semibold text-slate-900">{title}</h3>}
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
export function Table({
  columns,
  data,
  loading,
  emptyMessage = "No data found",
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-10 text-center text-slate-400"
              >
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-10 text-center text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 hover:bg-slate-50 transition"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-slate-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  ...props
}) {
  const variants = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm",
    ghost: "hover:bg-slate-100 text-slate-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-xl font-medium transition-all duration-200 ${
        variants[variant]
      } ${sizes[size]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      {...props}
    >
      {loading && <span className="animate-spin">⌛</span>}
      {children}
    </button>
  );
}

export function Select({ label, options, error, ...props }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-2.5 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? "border-red-400 bg-red-50" : "border-slate-300"
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-blue-100 text-blue-700",
    success: "bg-green-100 text-green-700",
    danger: "bg-red-100 text-red-700",
    warning: "bg-yellow-100 text-yellow-700",
    info: "bg-sky-100 text-sky-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function Toast({ message, type = "success", onClose }) {
  const types = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 px-5 py-3 rounded-xl border shadow-lg ${types[type]} z-50`}
    >
      {message}
    </div>
  );
}
export function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
      >
        Previous
      </button>

      <div className="flex gap-2">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`px-3 py-2 rounded-xl text-sm font-medium ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 border border-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
