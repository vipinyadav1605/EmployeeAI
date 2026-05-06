import React, { useState, useEffect } from "react";
import { useAuth } from "../App";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import { Card } from "../Components/common";
import { employeeAPI, leaveAPI, attendanceAPI } from "../services/api";

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  purple: "bg-purple-100 text-purple-600",
  green: "bg-green-100 text-green-600",
  orange: "bg-orange-100 text-orange-600",
};

const progressMap = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
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
          icon: " ",
        },
        {
          message: "Team attendance marked for today",
          time: "5 hours ago",
          icon: " ",
        },
        { message: "Q4 bonuses announced", time: "1 day ago", icon: " " },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "Request Leave", icon: " ", path: "/leaves" },
    { label: "Mark Attendance", icon: " ", path: "/attendance" },
    { label: "View Performance", icon: " ", path: "/performance-reviews" },
    { label: "Chat with Team", icon: " ", path: "/chat" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col">
        <Header
          title={`Welcome back, ${user?.name || "User"} `}
          subtitle="Here’s what’s happening in your team"
          stats={[
            { label: "Total Employees", value: stats.totalEmployees },
            { label: "Active Leaves", value: stats.activeLeaves },
            { label: "Pending Tasks", value: "3" },
            { label: "Team Performance", value: "92%" },
          ]}
        />

        <div className="flex-1 p-8 overflow-y-auto space-y-8">
          {/*  Quick Actions */}
          <div className="grid md:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <a
                key={action.label}
                href={action.path}
                className="group relative bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                {/* <div className="text-3xl mb-3 group-hover:scale-125 transition">
                  {action.icon}
                </div> */}

                <h3 className="font-semibold text-slate-900">{action.label}</h3>

                <p className="text-xs text-slate-500 mt-1">Click to access</p>

                <div className="absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 group-hover:opacity-100 transition"></div>
              </a>
            ))}
          </div>

          {/* Activity + Events */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Activity */}
            <Card title="Recent Activity" subtitle="Latest updates">
              <div className="space-y-4">
                {recentActivities.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-start border-b border-slate-200 pb-4 last:border-0"
                  >
                    {/* <div className="text-2xl">{item.icon}</div> */}

                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.message}
                      </p>
                      <p className="text-xs text-slate-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Events */}
            <Card title="Upcoming Events">
              <div className="space-y-4">
                {[
                  { event: "Standup", date: "Today", color: "blue" },
                  { event: "Review", date: "Tomorrow", color: "purple" },
                  { event: "Holiday", date: "Dec 25", color: "green" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-center p-3 rounded-xl hover:bg-slate-100 transition"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        colorMap[item.color]
                      }`}
                    >
                      {i + 1}
                    </div>

                    <div>
                      <p className="text-sm font-medium">{item.event}</p>
                      <p className="text-xs text-slate-500">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/*  Performance + Stats */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Performance */}
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

            {/* Quick Stats */}
            <Card title="Quick Stats">
              <div className="space-y-3">
                {[
                  { label: "Leave Balance", value: "12 days", color: "green" },
                  { label: "Pending", value: "3", color: "purple" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition"
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
