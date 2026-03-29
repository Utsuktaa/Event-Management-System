import { useNavigate } from "react-router-dom";
import { clearAuthCookies } from "../Utils/auth";
import { Shield, BarChart2, Flag, FileText } from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthCookies();
    window.location.href = "/";
  };

  const cards = [
    {
      icon: Shield,
      title: "Assign Club Admins",
      desc: "Manage club administrators",
      route: "/assign-admins",
    },
    {
      icon: BarChart2,
      title: "Attendance",
      desc: "View system attendance analytics",
      route: "/attendance-analytics",
    },
    {
      icon: Flag,
      title: "Moderation",
      desc: "Review reported posts and comments",
      route: "/moderation",
    },
    {
      icon: FileText,
      title: "Reports",
      desc: "Generate system reports",
      route: "/reports",
    },
  ];

  return (
    <div className="min-h-screen bg-purple-950 relative overflow-hidden font-poppins text-white">
      <div className="relative z-20 max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-1 flex-1 bg-blue-400" />
          <h1 className="font-pixel text-4xl uppercase tracking-wider">
            Admin Panel
          </h1>
          <div className="h-1 flex-1 bg-blue-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map(({ icon: Icon, title, desc, route }, i) => (
            <div
              key={title}
              onClick={() => navigate(route)}
              className="p-8 cursor-pointer border border-blue-400 bg-purple-950 transition-all duration-200 hover:translate-x-2 hover:-translate-y-2"
            >
              <div className="inline-flex p-4 border-4 border-blue-400 mb-6">
                <Icon className="w-8 h-8 text-white" />
              </div>

              <h3 className="font-pixel text-3xl mb-2">{title}</h3>
              <p className="text-lg">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button
            onClick={handleLogout}
            className="px-6 py-3 border border-blue-400 font-pixel text-lg uppercase tracking-wider hover:bg-blue-400 hover:text-purple-950 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
