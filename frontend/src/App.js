import React, { createContext, useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
// import "./App.css";
// Pages
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import AdminDashboard from "./Pages/AdminDashboard";
import EmployeeManagement from "./Pages/EmployeeManagement";
import LeaveManagement from "./Pages/LeaveManagement";
import AttendanceManagement from "./Pages/AttendanceManagement";
import BonusManagement from "./Pages/BonusManagement";
import PerformanceReviews from "./Pages/PerformanceReviews";
import ProjectManagement from "./Pages/ProjectManagement";
import ChatPage from "./Pages/ChatPage";
import NotificationsPage from "./Pages/NotificationsPage";
import ProfilePage from "./Pages/ProfilePage";
import MLPage from "./Pages/ML_Page";
import RAGPage from "./Pages/RAGPage";
import AIChatPage from "./Pages/AIChatPage";

// Auth Context
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
        <div className="flex items-center gap-3 text-sm font-medium text-slate-700">
          <span className="h-3 w-3 animate-pulse rounded-full bg-blue-600"></span>
          Loading workspace...
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  return user ? children : <Navigate to="/login" replace />;
}

// Role-Based Route Component
function RoleRoute({ children, requiredRole, requiredRoles }) {
  const { user, loading } = useAuth();
  const allowedRoles = requiredRoles || (requiredRole ? [requiredRole] : []);

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

const protectedRoutes = [
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/employees", element: <EmployeeManagement /> },
  { path: "/leaves", element: <LeaveManagement /> },
  { path: "/attendance", element: <AttendanceManagement /> },
  { path: "/performance-reviews", element: <PerformanceReviews /> },
  { path: "/projects", element: <ProjectManagement /> },
  { path: "/chat", element: <ChatPage /> },
  { path: "/notifications", element: <NotificationsPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/ml", element: <MLPage /> },
  { path: "/rag", element: <RAGPage /> },
  { path: "/ai-chat", element: <AIChatPage /> },
];

const roleRoutes = [
  {
    path: "/bonuses",
    element: <BonusManagement />,
    requiredRoles: ["admin", "finance"],
  },
  { path: "/admin", element: <AdminDashboard />, requiredRole: "admin" },
];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {protectedRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={<ProtectedRoute>{route.element}</ProtectedRoute>}
            />
          ))}

          {roleRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                <RoleRoute
                  requiredRole={route.requiredRole}
                  requiredRoles={route.requiredRoles}
                >
                  {route.element}
                </RoleRoute>
              }
            />
          ))}

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
