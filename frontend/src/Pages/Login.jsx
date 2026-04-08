import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleAuth from "../Components/GoogleAuth";
import Logo from "../Components/Logo";
import { API_BASE } from "../config";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 40%, #e0e7ff 100%)" }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #c4b5fd, transparent 70%)" }} />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-25 blur-3xl"
          style={{ background: "radial-gradient(circle, #a5b4fc, transparent 70%)" }} />
      </div>

      <div
        className="relative w-full max-w-md mx-4 rounded-3xl p-8"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(124,58,237,0.14)",
          boxShadow: "0 8px 40px rgba(124,58,237,0.12)",
        }}
      >
        <div className="flex justify-center mb-6">
          <Logo />
        </div>

        <h2 className="text-2xl font-bold text-center mb-6" style={{ color: "#1E3A8A" }}>
          Welcome back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 outline-none transition"
              style={{ border: "1px solid rgba(124,58,237,0.2)", boxShadow: "0 1px 4px rgba(124,58,237,0.06)" }}
              onFocus={(e) => (e.target.style.borderColor = "#7C3AED")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.2)")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 outline-none transition"
              style={{ border: "1px solid rgba(124,58,237,0.2)", boxShadow: "0 1px 4px rgba(124,58,237,0.06)" }}
              onFocus={(e) => (e.target.style.borderColor = "#7C3AED")}
              onBlur={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.2)")}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg, #1E3A8A, #7C3AED)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}
          >
            Login
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.15)" }} />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.15)" }} />
        </div>

        <GoogleAuth />

        <p className="text-center text-sm mt-5" style={{ color: "#6B7280" }}>
          No account?{" "}
          <span
            className="font-semibold cursor-pointer"
            style={{ color: "#7C3AED" }}
            onClick={() => navigate("/signup")}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
