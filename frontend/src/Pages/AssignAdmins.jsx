import { useNavigate } from "react-router-dom";
import SuperAdminDashboard from "../Components/SuperAdminDashboard";
import Logo from "../Components/Logo";
import { ArrowLeft } from "lucide-react";

export default function AssignAdmins() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 40%, #e0e7ff 100%)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(circle, #c4b5fd, transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle, #a5b4fc, transparent 70%)",
          }}
        />
      </div>

      <nav
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 24px rgba(124,58,237,0.10)",
          borderBottom: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        <Logo />
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition hover:bg-purple-50"
          style={{ color: "#6B7280" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-1 h-8 rounded-full"
              style={{ background: "linear-gradient(180deg,#7C3AED,#4f46e5)" }}
            />
            <h1 className="text-3xl font-bold" style={{ color: "#1E3A8A" }}>
              Assign Admins
            </h1>
          </div>
        </div>

        <SuperAdminDashboard />
      </main>

      <footer
        className="relative z-10 py-8 text-center text-xs border-t"
        style={{
          color: "rgba(107,114,128,0.6)",
          borderColor: "rgba(124,58,237,0.10)",
        }}
      >
        © 2025 EventSync
      </footer>
    </div>
  );
}
