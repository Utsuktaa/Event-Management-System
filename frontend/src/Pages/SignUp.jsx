import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleAuth from "../Components/GoogleAuth";
import Logo from "../Components/Logo";
import { API_BASE } from "../config";

const SignUp = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `role=${data.role}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `email=${data.email}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `name=${data.name}; path=/; max-age=604800; SameSite=Lax`;
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
      alert("Signup failed");
    }
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 outline-none transition border border-purple-200 focus:border-purple-500 shadow-sm";

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

        <h2 className="text-2xl font-bold text-center mb-6 text-blue-900">Create your account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Name", name: "name", type: "text", placeholder: "Your name" },
            { label: "Email", name: "email", type: "email", placeholder: "you@example.com" },
            { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
          ].map(({ label, name, type, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-1.5 text-gray-700">{label}</label>
              <input type={type} name={name} value={formData[name]} onChange={handleChange} required placeholder={placeholder} className={inputCls} />
            </div>
          ))}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-br from-blue-900 to-purple-700 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition shadow-[0_4px_14px_rgba(124,58,237,0.35)]"
          >
            Sign Up
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-purple-100" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-purple-100" />
        </div>

        <GoogleAuth />

        <p className="text-center text-sm mt-5 text-gray-500">
          Already have an account?{" "}
          <span className="font-semibold cursor-pointer text-purple-600" onClick={() => navigate("/login")}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
