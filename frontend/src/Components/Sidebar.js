import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";

const menuItems = [
  {
    name: "Dashboard",
    icon: "📊",
    path: "/dashboard",
    roles: ["admin", "manager", "hr", "finance", "employee"],
  },
  {
    name: "Employees",
    icon: "👥",
    path: "/employees",
    roles: ["admin", "hr", "manager"],
  },
  {
    name: "Leaves",
    icon: "📅",
    path: "/leaves",
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Attendance",
    icon: "📍",
    path: "/attendance",
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Bonuses",
    icon: "💰",
    path: "/bonuses",
    roles: ["admin", "finance"],
  },
  {
    name: "Performance",
    icon: "⭐",
    path: "/performance-reviews",
    roles: ["admin", "hr", "manager"],
  },
  {
    name: "Projects",
    icon: "🎯",
    path: "/projects",
    roles: ["admin", "manager"],
  },
  {
    name: "Chat",
    icon: "💬",
    path: "/chat",
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Notifications",
    icon: "🔔",
    path: "/notifications",
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "ML",
    icon: "🤖",
    path: "/ml",
    roles: ["admin", "hr", "manager", "employee"], // include employee
  },
  {
    name: "RAG",
    icon: "📚",
    path: "/rag",
    roles: ["admin", "hr", "manager", "employee"], // include employee
  },
  {
    name: "AI Chat",
    icon: "🧠",
    path: "/ai-chat",
    roles: ["admin", "hr", "manager", "employee"], // open for all
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white h-screen flex flex-col fixed left-0 top-0 z-40 shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
          EH
        </div>
        <div>
          <div className="font-semibold text-lg tracking-wide">
            Employ<span className="text-blue-400">Hub</span>
          </div>
          <div className="text-xs text-slate-400">HR System</div>
        </div>
      </div>

      <nav className="flex-1 p-0 space-y-0 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 shadow-md text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:translate-x-1"
              }`}
            >
              <span className="text-sm font-medium tracking-wide">
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>
      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => navigate("/profile")}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition-all duration-200"
        >
          <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
            {initials}
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-white">
              {user?.name || "User"}
            </div>
            <div className="text-xs text-slate-400 capitalize">
              {user?.role || "employee"}
            </div>
          </div>
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="w-full mt-3 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
