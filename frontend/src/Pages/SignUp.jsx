import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignUpWithGoogle from "../Components/SignUpWithGoogle";
import { GoogleOAuthProvider } from "@react-oauth/google";
const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
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
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        document.cookie = `token=${data.token}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;
        document.cookie = `role=${data.role}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;
        document.cookie = `email=${data.email}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;
        document.cookie = `name=${data.name}; path=/; max-age=${
          7 * 24 * 60 * 60
        }`;

        // Redirect based on role
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

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <div
        className="flex items-center justify-center h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/image/background.jpg')" }}
      >
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-md w-96 bg-opacity-80"
        >
          <h2 className="text-3xl font-bold mb-6 text-center">Sign Up</h2>

          <label className="block mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded mb-4"
            placeholder="Your Name"
          />

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
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mb-4"
          >
            Sign Up
          </button>

          <div className="text-center mb-4">OR</div>

          <SignUpWithGoogle />

          <p className="text-center mt-4">
            Already have an account?{" "}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate("/login")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignUp;
