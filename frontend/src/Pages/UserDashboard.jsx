import { useNavigate } from "react-router-dom";
import { Settings, LogOut } from "lucide-react";
import { clearAuthCookies } from "../Utils/auth";
import DashboardDesign from "../Components/DashboardDesign";
import Logo from "../Components/Logo";

export default function UserDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthCookies();
    navigate("/login");
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0f9ff 100%)" }}
    >
      <nav
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 1px 16px rgba(124,58,237,0.07)",
          borderBottom: "1px solid rgba(124,58,237,0.08)",
        }}
      >
        <Logo />

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all hover:bg-purple-50"
            style={{ color: "#6B7280" }}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #1E3A8A, #7C3AED)",
              color: "white",
            }}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </nav>

      <DashboardDesign />

      <footer
        className="py-8 text-center text-xs border-t"
        style={{
          color: "rgba(107,114,128,0.7)",
          borderColor: "rgba(124,58,237,0.08)",
        }}
      >
        © 2025 EventSync
      </footer>
    </div>
  );
}
