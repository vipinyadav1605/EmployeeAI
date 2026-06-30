import React from "react";

export default function Header({ title, subtitle, stats }) {
  return (
    <header className="lg:ml-64 bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
              EmployHub
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-950 tracking-tight mt-1">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
            {stats.map((stat, i) => (
              <div
                key={`${stat.label}-${i}`}
                className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
              >
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </div>
                <div className="text-2xl font-bold text-slate-950 mt-1">
                  {stat.value}
                </div>
                {stat.change !== undefined && (
                  <div
                    className={`text-xs mt-2 font-medium ${
                      stat.change > 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {stat.change > 0 ? "Up" : "Down"} {Math.abs(stat.change)}%
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
