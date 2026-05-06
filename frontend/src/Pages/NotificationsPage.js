import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card } from "../Components/common";

export default function NotificationsPage() {
  const [notifications] = useState([
    {
      id: 1,
      type: "leave",
      message: "Leave request approved",
      time: "2 hours ago",
    },
    { id: 2, type: "bonus", message: "Bonus announced", time: "1 day ago" },
  ]);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <Header title="Notifications" />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-8">
          {/* Page Heading */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-slate-700">
              Notifications Center
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Stay updated with your latest activities and alerts
            </p>
          </div>

          {/* Card */}
          <Card
            title="Recent Notifications"
            className="bg-white rounded-2xl shadow-lg border border-slate-200"
          >
            <div className="flex flex-col gap-4">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-start justify-between p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  {/* Left Content */}
                  <div>
                    <p className="font-medium text-slate-800">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                  </div>

                  {/* Type Badge */}
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      notif.type === "leave"
                        ? "bg-green-100 text-green-600"
                        : "bg-indigo-100 text-indigo-600"
                    }`}
                  >
                    {notif.type}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
