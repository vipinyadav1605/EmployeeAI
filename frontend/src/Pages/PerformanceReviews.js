import React from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card } from "../Components/common";

export default function PerformanceReviews() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <Header title="Performance Reviews" />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8">
          {/* Page Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-700">
              Employee Performance Overview
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Track reviews and upcoming evaluation schedules
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Your Reviews */}
            <Card
              title="Your Reviews"
              className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex items-center justify-center h-40">
                <p className="text-slate-500 text-center text-sm">
                  No reviews yet
                </p>
              </div>
            </Card>

            {/* Review Schedule */}
            <Card
              title="Review Schedule"
              className="bg-white rounded-2xl shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-200"
            >
              <div className="flex flex-col justify-center h-40 text-center">
                <p className="text-slate-600 text-sm mb-2">Next review in</p>
                <span className="text-3xl font-bold text-indigo-600">
                  30 Days
                </span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
