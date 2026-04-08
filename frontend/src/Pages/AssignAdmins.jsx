import { useNavigate } from "react-router-dom";
import SuperAdminDashboard from "../Components/SuperAdminDashboard";
import Logo from "../Components/Logo";
import { ArrowLeft } from "lucide-react";

export default function AssignAdmins() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-sans bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 relative overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl bg-violet-300" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl bg-indigo-300" />
      </div>

      <nav className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between bg-white/75 backdrop-blur-xl shadow-[0_1px_24px_rgba(124,58,237,0.10)] border-b border-purple-200/50">
        <Logo />
        <button
          onClick={() => navigate("/admin-dashboard")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-500 transition hover:bg-purple-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-1 h-8 rounded-full bg-gradient-to-b from-purple-600 to-indigo-500" />
          <h1 className="text-3xl font-bold text-blue-900">Assign Admins</h1>
        </div>
        <SuperAdminDashboard />
      </main>

      <footer className="relative z-10 py-8 text-center text-xs border-t border-purple-200/50 text-gray-400">
        © 2025 EventSync
      </footer>
    </div>
  );
}
