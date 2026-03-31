import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpWithGoogle from "../Components/SignUpWithGoogle";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Logo from "../Components/Logo";

const SignUp = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        document.cookie = `token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        document.cookie = `role=${data.role}; path=/; max-age=${7 * 24 * 60 * 60}`;
        document.cookie = `email=${data.email}; path=/; max-age=${7 * 24 * 60 * 60}`;
        document.cookie = `name=${data.name}; path=/; max-age=${7 * 24 * 60 * 60}`;
        if (data.role === "admin" || data.role === "superadmin") {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/user-dashboard";
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Signup failed");
    }
  };

  const inputStyle = {
    border: "1px solid rgba(124,58,237,0.2)",
    boxShadow: "0 1px 4px rgba(124,58,237,0.06)",
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
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
            Create your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { label: "Name", name: "name", type: "text", placeholder: "Your name" },
              { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
              { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#374151" }}>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  required
                  placeholder={placeholder}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 outline-none transition"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#7C3AED")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.2)")}
                />
              </div>
            ))}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 hover:scale-[1.01] active:scale-[0.99]"
              style={{ background: "linear-gradient(135deg, #1E3A8A, #7C3AED)", boxShadow: "0 4px 14px rgba(124,58,237,0.35)" }}
            >
              Sign Up
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.15)" }} />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(124,58,237,0.15)" }} />
          </div>

          <SignUpWithGoogle />

          <p className="text-center text-sm mt-5" style={{ color: "#6B7280" }}>
            Already have an account?{" "}
            <span
              className="font-semibold cursor-pointer"
              style={{ color: "#7C3AED" }}
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignUp;
