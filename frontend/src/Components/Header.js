import React from "react";

export default function Header({ title, subtitle, stats }) {
  return (
    <header className="ml-64 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="px-8 py-6">
        {/* Title Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="group bg-gradient-to-br from-white to-slate-50 p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Label */}
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {stat.label}
                </div>

                {/* Value */}
                <div className="text-2xl font-bold text-slate-900">
                  {stat.value}
                </div>

                {/* Change Indicator */}
                {stat.change !== undefined && (
                  <div
                    className={`text-xs mt-2 flex items-center gap-1 font-medium ${
                      stat.change > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    <span className="text-sm">
                      {stat.change > 0 ? "↑" : "↓"}
                    </span>
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
