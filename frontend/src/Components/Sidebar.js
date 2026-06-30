import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";

const menuItems = [
  {
    name: "Dashboard",
    icon: "DB",
    path: "/dashboard",
    roles: ["admin", "manager", "hr", "finance", "employee"],
  },
  {
    name: "Employees",
    icon: "EM",
    path: "/employees",
    roles: ["admin", "hr", "manager"],
  },
  {
    name: "Leaves",
    icon: "LV",
    path: "/leaves",
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Attendance",
    icon: "AT",
    path: "/attendance",
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Bonuses",
    icon: "BN",
    path: "/bonuses",
    roles: ["admin", "finance"],
  },
  {
    name: "Performance",
    icon: "PR",
    path: "/performance-reviews",
    roles: ["admin", "hr", "manager"],
  },
  {
    name: "Projects",
    icon: "PJ",
    path: "/projects",
    roles: ["admin", "manager"],
  },
  {
    name: "Chat",
    icon: "CH",
    path: "/chat",
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "Notifications",
    icon: "NT",
    path: "/notifications",
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "ML",
    icon: "ML",
    path: "/ml",
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "RAG",
    icon: "RG",
    path: "/rag",
    roles: ["admin", "hr", "manager", "employee"],
  },
  {
    name: "AI Chat",
    icon: "AI",
    path: "/ai-chat",
    roles: ["admin", "hr", "manager", "employee"],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const visibleMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );
  const mobileItems = visibleMenuItems.slice(0, 5);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  const goTo = (path) => navigate(path);

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-slate-950 text-white h-screen flex-col fixed left-0 top-0 z-40 border-r border-slate-800">
        <div className="px-5 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-base shadow-md">
            EH
          </div>
          <div>
            <div className="font-semibold text-lg tracking-tight">
              Employ<span className="text-blue-400">Hub</span>
            </div>
            <div className="text-xs text-slate-400">People operations</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => goTo(item.path)}
                className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-md flex items-center justify-center text-[11px] font-bold ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "bg-slate-900 text-slate-400 group-hover:text-white"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={() => goTo("/profile")}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-900 transition-all duration-200"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold shadow-md">
              {initials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {user?.name || "User"}
              </div>
              <div className="text-xs text-slate-400 capitalize">
                {user?.role || "employee"}
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="w-full mt-3 px-4 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="grid grid-cols-5">
          {mobileItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => goTo(item.path)}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium ${
                  isActive ? "text-blue-700" : "text-slate-500"
                }`}
              >
                <span
                  className={`h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-bold ${
                    isActive ? "bg-blue-50" : "bg-slate-100"
                  }`}
                >
                  {item.icon}
                </span>
                <span className="max-w-full truncate px-1">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
