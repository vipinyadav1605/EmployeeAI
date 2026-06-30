import React from "react";

export function Modal({ isOpen, title, children, onClose, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
          >
            x
          </button>
        </div>

        <div className="px-6 py-5">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 flex flex-wrap gap-2 justify-end bg-slate-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function Card({ children, title, subtitle, className = "" }) {
  return (
    <section
      className={`bg-white rounded-lg border border-slate-200 shadow-sm ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-slate-100">
          {title && (
            <h3 className="font-semibold text-slate-950 leading-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Table({
  columns,
  data = [],
  loading,
  emptyMessage = "No data found",
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {loading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-10 text-center text-slate-500"
              >
                Loading records...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-10 text-center text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} className="hover:bg-slate-50 transition">
                {columns.map((col) => (
                  <td key={col.key} className="px-5 py-4 text-slate-700">
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
  className = "",
  ...props
}) {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-900 border border-slate-300",
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
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        variants[variant]
      } ${sizes[size]} ${
        disabled || loading ? "opacity-60 cursor-not-allowed" : ""
      } ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
      )}
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
        className={`w-full px-4 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
    default: "bg-blue-50 text-blue-700 border-blue-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    danger: "bg-red-50 text-red-700 border-red-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    info: "bg-sky-50 text-sky-700 border-sky-100",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
}

export function Toast({ message, type = "success", onClose }) {
  const types = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
  };

  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 px-5 py-3 rounded-lg border shadow-lg ${types[type]} z-50`}
    >
      {message}
    </div>
  );
}

export function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-200">
      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>

      <div className="flex gap-2">
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => onPageChange(i + 1)}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <Button
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
}
