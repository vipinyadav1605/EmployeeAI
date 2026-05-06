import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../App";
import { Toast } from "../Components/common";
import { authAPI } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authAPI.login(email, password);
      const { access, refresh, user } = response.data;

      login(user, access, refresh);
      setToast("Login successful!");

      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Background blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12 text-center">
            <div className="w-16 h-16 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-md mb-4">
              <span className="text-2xl font-bold text-blue-600">EH</span>
            </div>
            <h1 className="text-3xl font-bold text-white">EmployHub</h1>
            <p className="text-blue-100 text-sm mt-1">
              Employee Management System
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {error && (
              <div className="mb-4 p-4 rounded-xl border border-red-200 bg-red-50 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400"></span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400">
                    🔒
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded border-slate-300" />
                  <span className="text-slate-600">Remember me</span>
                </label>
                <a className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer">
                  Forgot password?
                </a>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>→</span>
                    Sign in
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-300"></div>
              <span className="text-xs text-slate-500">OR</span>
              <div className="flex-1 h-px bg-slate-300"></div>
            </div>

            {/* Demo accounts */}
            <div className="space-y-2">
              <p className="text-sm text-slate-600 font-medium">
                Demo Accounts:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { email: "admin@company.com", role: "Admin" },
                  { email: "hr@company.com", role: "HR" },
                  { email: "manager@company.com", role: "Manager" },
                  { email: "employee@company.com", role: "Employee" },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => setEmail(demo.email)}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left"
                  >
                    <div className="text-sm font-medium text-slate-900">
                      {demo.role}
                    </div>
                    <div className="text-xs text-slate-500">{demo.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t text-center text-sm text-slate-600">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
      {/* <div className="bg-green-500 text-white p-5">Tailwind Working</div> */}
    </div>
  );
}
