import { useNavigate } from "react-router-dom";
import SuperAdminDashboard from "../Components/SuperAdminDashboard";
import Sidebar from "../Components/Sidebar";
import { ArrowLeft } from "lucide-react";

export default function AssignAdmins() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans flex bg-gray-50">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col ml-56">
        <header
          className="px-8 py-4 flex items-center gap-3 border-b"
          style={{
            background: "rgba(255,255,255,0.92)",
            borderColor: "rgba(124,58,237,0.10)",
          }}
        >
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-purple-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-semibold" style={{ color: "#1E3A8A" }}>Assign Admins</h1>
        </header>

        <main className="flex-1 max-w-5xl w-full mx-auto px-8 py-8">
          <SuperAdminDashboard />
        </main>

        <footer
          className="py-6 text-center text-xs border-t"
          style={{ color: "rgba(107,114,128,0.6)", borderColor: "rgba(124,58,237,0.10)" }}
        >
          © 2025 EventSync
        </footer>
      </div>
    </div>
  );
}
