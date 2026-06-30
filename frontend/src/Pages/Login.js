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
    <div className="min-h-screen grid lg:grid-cols-[1fr_480px] bg-slate-50">
      <section className="hidden lg:flex flex-col justify-between bg-slate-950 text-white p-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-blue-600 rounded-lg flex items-center justify-center font-bold">
            EH
          </div>
          <div>
            <div className="text-xl font-semibold">EmployHub</div>
            <div className="text-sm text-slate-400">People operations</div>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            Employee Management System
          </p>
          <h1 className="text-5xl font-bold tracking-tight mt-4">
            Manage HR workflows from one clear workspace.
          </h1>
          <p className="text-slate-300 mt-5 leading-7">
            Track employees, leave, attendance, bonuses, performance, and AI
            assistance with a focused dashboard for every role.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm text-slate-300">
          <div className="border border-slate-800 rounded-lg p-4">
            <div className="text-white font-semibold">Role based</div>
            <div className="mt-1">Secure access</div>
          </div>
          <div className="border border-slate-800 rounded-lg p-4">
            <div className="text-white font-semibold">AI ready</div>
            <div className="mt-1">Chat and RAG</div>
          </div>
          <div className="border border-slate-800 rounded-lg p-4">
            <div className="text-white font-semibold">Operational</div>
            <div className="mt-1">Daily HR tools</div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
              EH
            </div>
            <div>
              <div className="text-xl font-semibold">EmployHub</div>
              <div className="text-sm text-slate-500">People operations</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-6 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-slate-950">Sign in</h1>
              <p className="text-sm text-slate-500 mt-1">
                Access your employee management workspace.
              </p>
            </div>

            <div className="px-6 py-6">
              {error && (
                <div className="mb-4 p-4 rounded-lg border border-red-200 bg-red-50 text-sm text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-slate-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="mt-6 space-y-2">
                <p className="text-sm text-slate-600 font-medium">
                  Demo accounts
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
                      className="p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition text-left"
                    >
                      <div className="text-sm font-medium text-slate-950">
                        {demo.role}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {demo.email}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t text-center text-sm text-slate-600">
              Do not have an account?{" "}
              <Link
                to="/register"
                className="text-blue-600 font-medium hover:underline"
              >
                Create one
              </Link>
            </div>
          </div>
        </div>
      </section>

      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
    </div>
  );
}
