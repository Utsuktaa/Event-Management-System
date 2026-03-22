import React from "react";
import { useNavigate } from "react-router-dom";
import { clearAuthCookies } from "../Utils/auth";
import DashboardDesign from "../Components/DashboardDesign";
import { LucideSettings, LucideBell, LucideUser } from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    clearAuthCookies();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <nav className="fixed top-0 inset-x-0 bg-white border-b border-gray-200 shadow-sm z-30 flex justify-between items-center px-6 h-16">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold text-purple-600">JollyGo 🎉</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative">
            <LucideBell className="w-5 h-5 text-gray-600 hover:text-purple-600 transition" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full"></span>
          </button>
          <button
            className="flex items-center gap-1 hover:text-purple-600 transition"
            onClick={() => navigate("/profile")}
          >
            <LucideUser className="w-5 h-5 text-gray-600" /> Profile
          </button>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-purple-600 transition"
          >
            Logout
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="text-sm text-gray-600 hover:text-purple-600 transition flex items-center gap-1"
          >
            <LucideSettings className="w-4 h-4 text-gray-600" /> Settings
          </button>
        </div>
      </nav>

      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-1">
            Welcome to JollyGo 🎊
          </h2>
          <p className="text-gray-500 text-sm sm:text-base">
            Track events, XP, and progress in a fun, interactive way!
          </p>
        </header>

        <DashboardDesign />

        <footer className="py-6 text-center text-gray-400 text-xs border-t border-gray-200 mt-12">
          &copy; 2025 JollyGo |{" "}
          <span className="underline cursor-pointer">FAQ</span> |{" "}
          <span className="underline cursor-pointer">Legal</span>
        </footer>
      </main>
    </div>
  );
};

export default UserDashboard;
