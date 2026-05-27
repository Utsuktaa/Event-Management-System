import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import GoogleAuth from "../Components/GoogleAuth";
import Logo from "../Components/Logo";
import { API_BASE } from "../config";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Show success message if redirected after registration
  const justRegistered = location.state?.registered;

  const validate = (data) => {
    const errs = {};
    if (!data.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Enter a valid email address.";
    if (!data.password) errs.password = "Password is required.";
    return errs;
  };

  const handleChange = (e) => {
    const updated = { ...formData, [e.target.name]: e.target.value };
    setFormData(updated);
    if (touched[e.target.name]) {
      setErrors((prev) => ({ ...prev, ...validate(updated) }));
    }
    setServerError("");
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
    setErrors((prev) => ({ ...prev, ...validate(formData) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    const errs = validate(formData);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setServerError("");
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        document.cookie = `email=${data.email}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `name=${data.name}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `role=${data.role}; path=/; max-age=604800; SameSite=Lax`;
        if (data.role === "admin" || data.role === "superadmin") {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/user-dashboard";
        }
      } else {
        const msg = data.message || "";
        // Route specific backend messages to the right field
        if (msg.toLowerCase().includes("email") || msg.toLowerCase().includes("account")) {
          setErrors((prev) => ({ ...prev, email: msg }));
        } else if (msg.toLowerCase().includes("password") || msg.toLowerCase().includes("incorrect")) {
          setErrors((prev) => ({ ...prev, password: msg }));
        } else {
          setServerError(msg || "Login failed. Please try again.");
        }
      }
    } catch {
      setServerError("Network error. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls = (field) =>
    `w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 outline-none transition border shadow-sm ${
      touched[field] && errors[field]
        ? "border-red-400 focus:border-red-500"
        : "border-purple-200 focus:border-purple-500"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl bg-violet-300" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-25 blur-3xl bg-indigo-300" />
      </div>

      <div className="relative w-full max-w-md mx-4 rounded-3xl p-8 bg-white/75 backdrop-blur-xl border border-purple-200/50 shadow-[0_8px_40px_rgba(124,58,237,0.12)]">
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">Welcome back</h2>

        {justRegistered && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Account created! You can now log in.
          </div>
        )}

        {serverError && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="you@example.com"
              className={inputCls("email")}
            />
            {touched.email && errors.email && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="••••••••"
                className={`${inputCls("password")} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {touched.password && errors.password && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 mt-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {errors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-blue-900 to-purple-700 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition shadow-[0_4px_14px_rgba(124,58,237,0.35)] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
          >
            {submitting ? "Logging in…" : "Login"}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-purple-100" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-purple-100" />
        </div>

        <GoogleAuth />

        <p className="text-center text-sm mt-5 text-gray-500">
          No account?{" "}
          <span className="font-semibold cursor-pointer text-purple-600" onClick={() => navigate("/signup")}>
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
