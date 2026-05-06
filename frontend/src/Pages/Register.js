import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";
import { Toast } from "../Components/common";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    empId: "",
    name: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
    department: "",
    position: "",
    role: "employee",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      await authAPI.register(formData);
      setToast("Registration successful! Redirecting...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData) {
        setErrors(errorData);
      } else {
        setErrors({ general: "Registration failed. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20"></div>

      <div className="relative w-full max-w-2xl">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-md">
              <span className="text-2xl font-bold text-blue-600">EH</span>
            </div>
            <h1 className="text-3xl font-bold text-white">Create Account</h1>
            <p className="text-blue-100 text-sm mt-1">
              Join EmployHub and manage your career
            </p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {errors.general && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Employee ID */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="empId"
                  value={formData.empId}
                  onChange={handleChange}
                  placeholder="EMP001"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>

              {/* Name + Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-xl border transition ${
                      errors.name
                        ? "border-red-300 bg-red-50"
                        : "border-slate-300 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 rounded-xl border transition ${
                      errors.email
                        ? "border-red-300 bg-red-50"
                        : "border-slate-300 focus:ring-2 focus:ring-blue-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Passwords */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="password2"
                    placeholder="Confirm Password"
                    value={formData.password2}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Phone + Department */}
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Position */}
              <input
                type="text"
                name="position"
                placeholder="Position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium shadow-md hover:shadow-lg hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-8 py-4 bg-slate-50 border-t text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
    </div>
  );
}
