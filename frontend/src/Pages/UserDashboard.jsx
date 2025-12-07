import React from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthCookies } from "../Utils/auth";
import DashboardDesign from "../Components/DashboardDesign";
const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthCookies();
    navigate("/login"); // redirect to login
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      <nav className="px-6 py-4 flex justify-between items-center bg-white/60 backdrop-blur-md shadow-sm rounded-b-3xl">
        <h1 className="text-lg font-semibold text-purple-700">
          User Dashboard
        </h1>
        <ul className="flex space-x-4 text-gray-600 text-sm font-medium">
          {["Home", "Events", "Reports", "Settings"].map((item) => (
            <li
              key={item}
              className="hover:text-purple-900 transition cursor-pointer"
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>

      <header className="py-16 text-center px-6 bg-gradient-to-b from-purple-50 to-pink-50">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Welcome to EventSync
        </h2>
        <p className="text-gray-500 max-w-md mx-auto text-base sm:text-lg">
          Explore Events
        </p>
      </header>

      <DashboardDesign />

      {/* Footer */}
      <footer className="py-10 text-center text-gray-500 text-sm border-t border-gray-200">
        &copy; 2025 EventSync
      </footer>
    </div>
  );
};

export default UserDashboard;
