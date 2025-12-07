import { GoogleOAuthProvider } from "@react-oauth/google";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginWithGoogle from "../Components/LoginWithGoogle";
// import Logo from "../Components/Logo";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data);
        document.cookie = `email=${data.email}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;
        document.cookie = `name=${data.name}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;
        document.cookie = `token=${data.token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;
        document.cookie = `role=${data.role}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;
        if (data.role === "admin" || data.role === "superadmin") {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/user-dashboard";
        }
      } else alert(data.message);
    } catch (error) {}
  };

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/image/background.jpg')" }}
    >
      {/* <Logo /> */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/50 p-8 rounded-lg shadow-md w-96"
      >
        <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

        <label className="block mb-2">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded mb-4"
          placeholder="Your Email"
        />

        <label className="block mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded mb-6"
          placeholder="Your Password"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 mb-4"
        >
          Login
        </button>

        <div className="text-center mb-4">OR</div>

        <GoogleOAuthProvider clientId="931347685047-es5og9c0land051gpbm4qqc3cfnq576r.apps.googleusercontent.com">
          <LoginWithGoogle />
        </GoogleOAuthProvider>

        <p className="text-center">
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </span>
        </p>

        <p className="text-center">
          Create an account?
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </form>
    </div>
  );
};

export default Login;
