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

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  return user ? children : <Navigate to="/login" />;
}

// Role-Based Route Component
function RoleRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }
  return children;
}

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Employee Management Routes */}
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <EmployeeManagement />
              </ProtectedRoute>
            }
          />

          {/* Leave Routes */}
          <Route
            path="/leaves"
            element={
              <ProtectedRoute>
                <LeaveManagement />
              </ProtectedRoute>
            }
          />

          {/* Attendance Routes */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendanceManagement />
              </ProtectedRoute>
            }
          />

          {/* Bonus Routes */}
          <Route
            path="/bonuses"
            element={
              <RoleRoute requiredRole="admin">
                <BonusManagement />
              </RoleRoute>
            }
          />

          {/* Performance Reviews Routes */}
          <Route
            path="/performance-reviews"
            element={
              <ProtectedRoute>
                <PerformanceReviews />
              </ProtectedRoute>
            }
          />

          {/* Project Routes */}
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <ProjectManagement />
              </ProtectedRoute>
            }
          />

          {/* Chat Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />

          {/* Notifications Routes */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Profile Routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <RoleRoute requiredRole="admin">
                <AdminDashboard />
              </RoleRoute>
            }
          />

          {/* Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
          <Route path="/ml" element={<MLPage />} />
          <Route path="/rag" element={<RAGPage />} />
          <Route path="/ai-chat" element={<AIChatPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
