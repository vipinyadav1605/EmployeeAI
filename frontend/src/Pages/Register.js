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

  const fieldClass =
    "w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_640px] bg-slate-50">
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
            New employee access
          </p>
          <h1 className="text-5xl font-bold tracking-tight mt-4">
            Create an account for your HR workspace.
          </h1>
          <p className="text-slate-300 mt-5 leading-7">
            Register employee details once and keep the experience consistent
            across dashboard, attendance, leave, and collaboration tools.
          </p>
        </div>

        <p className="text-sm text-slate-400">
          Already registered? Sign in with your company email.
        </p>
      </section>

      <section className="flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
              EH
            </div>
            <div>
              <div className="text-xl font-semibold">EmployHub</div>
              <div className="text-sm text-slate-500">People operations</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
            <div className="px-6 py-6 border-b border-slate-100">
              <h1 className="text-2xl font-bold text-slate-950">
                Create Account
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Add your employee details to request workspace access.
              </p>
            </div>

            <div className="px-6 py-6">
              {errors.general && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className={fieldClass}
                  />
                </div>

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
                      className={`${fieldClass} ${
                        errors.name ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.name}
                      </p>
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
                      className={`${fieldClass} ${
                        errors.email ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`${fieldClass} ${
                        errors.password ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {errors.password && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="password2"
                      value={formData.password2}
                      onChange={handleChange}
                      className={`${fieldClass} ${
                        errors.password2 ? "border-red-300 bg-red-50" : ""
                      }`}
                    />
                    {errors.password2 && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors.password2}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                  <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={formData.department}
                    onChange={handleChange}
                    className={fieldClass}
                  />
                </div>

                <input
                  type="text"
                  name="position"
                  placeholder="Position"
                  value={formData.position}
                  onChange={handleChange}
                  className={fieldClass}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-blue-600 text-white font-medium shadow-sm hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </form>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t text-center text-sm text-slate-600">
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
      </section>

      {toast && (
        <Toast message={toast} type="success" onClose={() => setToast(null)} />
      )}
    </div>
  );
}
