import { useNavigate } from "react-router-dom";
import { clearAuthCookies } from "../Utils/auth";
import { Shield, BarChart2, Flag, FileText, LogOut } from "lucide-react";
import Logo from "../Components/Logo";

const CARDS = [
  { icon: Shield, title: "Assign Club Admins", desc: "Manage club administrators", route: "/assign-admins", gradient: "linear-gradient(135deg,#1E3A8A,#4f46e5)", glow: "rgba(30,58,138,0.25)" },
  { icon: BarChart2, title: "Attendance", desc: "View system attendance analytics", route: "/attendance-analytics", gradient: "linear-gradient(135deg,#7c3aed,#4f46e5)", glow: "rgba(124,58,237,0.25)" },
  { icon: Flag, title: "Moderation", desc: "Review reported posts and comments", route: "/moderation", gradient: "linear-gradient(135deg,#7c3aed,#a855f7)", glow: "rgba(168,85,247,0.25)" },
  { icon: FileText, title: "Reports", desc: "Generate system reports", route: "/reports", gradient: "linear-gradient(135deg,#4f46e5,#0ea5e9)", glow: "rgba(79,70,229,0.25)" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthCookies();
    window.location.href = "/";
  };

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #ede9fe 0%, #f5f3ff 40%, #e0e7ff 100%)" }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #c4b5fd, transparent 70%)" }} />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #a5b4fc, transparent 70%)" }} />
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
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition hover:opacity-90 hover:scale-105"
          style={{ background: "linear-gradient(135deg,#1E3A8A,#7C3AED)", color: "white" }}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 py-14">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-8 rounded-full" style={{ background: "linear-gradient(180deg,#7C3AED,#4f46e5)" }} />
            <h1 className="text-3xl font-bold" style={{ color: "#1E3A8A" }}>Admin Panel</h1>
          </div>
          
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CARDS.map(({ icon: Icon, title, desc, route, gradient, glow }) => (
            <div
              key={title}
              onClick={() => navigate(route)}
              className="relative rounded-2xl p-6 cursor-pointer transition-all duration-200 overflow-hidden group"
              style={{
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(124,58,237,0.12)",
                boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = `0 12px 32px ${glow}`;
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 2px 16px rgba(124,58,237,0.07)";
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.12)";
              }}
            >
              <div className="absolute -bottom-6 -right-6 w-20 h-20 rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: glow }} />
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: gradient, boxShadow: `0 4px 14px ${glow}` }}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-base mb-1" style={{ color: "#1E3A8A" }}>{title}</h3>
              <p className="text-sm" style={{ color: "#6B7280" }}>{desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center text-xs border-t"
        style={{ color: "rgba(107,114,128,0.6)", borderColor: "rgba(124,58,237,0.10)" }}>
        © 2025 EventSync
      </footer>
    </div>
  );
}
