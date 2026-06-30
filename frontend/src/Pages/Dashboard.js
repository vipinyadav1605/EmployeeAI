import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../App";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card } from "../Components/common";
import { employeeAPI, leaveAPI, attendanceAPI } from "../services/api";

const colorMap = {
  blue: "bg-blue-50 text-blue-700",
  purple: "bg-violet-50 text-violet-700",
  green: "bg-emerald-50 text-emerald-700",
  orange: "bg-amber-50 text-amber-700",
};

const progressMap = {
  green: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-violet-500",
  orange: "bg-amber-500",
};

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeLeaves: 0,
    pendingApprovals: 0,
    upcomingEvents: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const empRes = await employeeAPI.list({ page: 1, limit: 1 });
      const leavesRes = await leaveAPI.list({ status: "pending" });
      await attendanceAPI.getSummary();

      setStats({
        totalEmployees: empRes.data.count || 0,
        activeLeaves: leavesRes.data.count || 0,
        pendingApprovals: 0,
        upcomingEvents: 5,
      });

      setRecentActivities([
        {
          message: "John Doe requested leave",
          time: "2 hours ago",
        },
        {
          message: "Team attendance marked for today",
          time: "5 hours ago",
        },
        { message: "Q4 bonuses announced", time: "1 day ago" },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "Request Leave", path: "/leaves" },
    { label: "Mark Attendance", path: "/attendance" },
    { label: "View Performance", path: "/performance-reviews" },
    { label: "Chat with Team", path: "/chat" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col">
        <Header
          title={`Welcome back, ${user?.name || "User"}`}
          subtitle="Here is what is happening across your team today."
          stats={[
            { label: "Total Employees", value: stats.totalEmployees },
            { label: "Active Leaves", value: stats.activeLeaves },
            { label: "Pending Tasks", value: stats.pendingApprovals || "3" },
            { label: "Team Performance", value: "92%" },
          ]}
        />

        <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.path}
                className="group bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-200"
              >
                <h3 className="font-semibold text-slate-950">
                  {action.label}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Open workspace</p>
              </Link>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Recent Activity" subtitle="Latest updates">
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-slate-500">Loading activity...</p>
                ) : (
                  recentActivities.map((item, i) => (
                    <div
                      key={i}
                      className="flex gap-4 items-start border-b border-slate-200 pb-4 last:border-0"
                    >
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-950">
                          {item.message}
                        </p>
                        <p className="text-xs text-slate-500">{item.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            <Card title="Upcoming Events">
              <div className="space-y-3">
                {[
                  { event: "Standup", date: "Today", color: "blue" },
                  { event: "Review", date: "Tomorrow", color: "purple" },
                  { event: "Holiday", date: "Dec 25", color: "green" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-center p-3 rounded-lg hover:bg-slate-50 transition"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        colorMap[item.color]
                      }`}
                    >
                      {i + 1}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-950">
                        {item.event}
                      </p>
                      <p className="text-xs text-slate-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="Performance">
              <div className="space-y-5">
                {[
                  { label: "Attendance", value: 95, color: "green" },
                  { label: "Productivity", value: 88, color: "blue" },
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{m.label}</span>
                      <span className="font-semibold">{m.value}%</span>
                    </div>

                    <div className="h-2 bg-slate-200 rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          progressMap[m.color]
                        } transition-all duration-500`}
                        style={{ width: `${m.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Quick Stats">
              <div className="space-y-3">
                {[
                  { label: "Leave Balance", value: "12 days" },
                  { label: "Pending", value: "3" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                  >
                    <span className="text-sm">{item.label}</span>
                    <span className="font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
