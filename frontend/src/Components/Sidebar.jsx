import { useNavigate, useLocation } from "react-router-dom";
import {
  House,
  Users,
  LogOut,
  Settings,
  Calendar,
  Trophy,
  Activity,
  Shield,
  BarChart2,
  Flag,
  FileText,
  ClipboardList,
} from "lucide-react";
import { clearAuthCookies } from "../Utils/auth";
import Logo from "./Logo";

const userGroups = [
  {
    label: "Menu",
    items: [
      { icon: House,         label: "Dashboard",  path: "/user-dashboard" },
      { icon: Users,         label: "Clubs",      path: "/join-clubs" },
      { icon: Calendar,      label: "My Events",  path: "/my-events" },
    ],
  },
  {
    label: "Personal",
    items: [
      { icon: Trophy,        label: "Leaderboard", path: "/leaderboard" },
      { icon: Activity,      label: "Activity",    path: "/activity" },
      { icon: ClipboardList, label: "Attendance",  path: "/attendance" },
    ],
  },
];

const adminGroups = [
  {
    label: "Overview",
    items: [
      { icon: House,     label: "Dashboard",     path: "/admin-dashboard" },
      { icon: Shield,    label: "Assign Admins", path: "/assign-admins" },
    ],
  },
  {
    label: "Manage",
    items: [
      { icon: BarChart2, label: "Attendance",    path: "/attendance-analytics" },
      { icon: Flag,      label: "Moderation",    path: "/moderation" },
      { icon: FileText,  label: "Reports",       path: "/reports" },
    ],
  },
];

export default function Sidebar({ role = "user" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuthCookies();
    navigate("/login");
  };

  const groups = role === "admin" ? adminGroups : userGroups;

  const isActive = (path) => location.pathname === path;

  return (
    <aside
      className="fixed top-0 left-0 h-full w-56 flex flex-col z-50"
      style={{
        background: "#ffffff",
        borderRight: "1px solid rgba(124,58,237,0.12)",
      }}
    >
      <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(124,58,237,0.10)" }}>
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ icon: Icon, label, path }) => {
                const active = isActive(path);
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className="w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
                    style={
                      active
                        ? {
                            background: "rgba(124,58,237,0.10)",
                            color: "#7C3AED",
                            borderLeft: "3px solid #7C3AED",
                            paddingLeft: "calc(0.75rem - 3px)",
                            paddingRight: "0.75rem",
                          }
                        : {
                            color: "#6B7280",
                            paddingLeft: "0.75rem",
                            paddingRight: "0.75rem",
                          }
                    }
                  >
                    <Icon
                      className="flex-shrink-0"
                      style={{
                        width: "1rem",
                        height: "1rem",
                        strokeWidth: active ? 2.5 : 1.75,
                        color: active ? "#7C3AED" : "#9CA3AF",
                      }}
                    />
                    <span style={{ fontWeight: active ? 600 : 500 }}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t space-y-0.5" style={{ borderColor: "rgba(124,58,237,0.10)" }}>
        <p className="px-3 mb-1 text-xs font-bold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
          Account
        </p>
        {[
          { icon: Settings, label: "Settings", path: "/settings", onClick: () => navigate("/settings") },
          { icon: LogOut,   label: "Logout",   path: null,         onClick: handleLogout, danger: true },
        ].map(({ icon: Icon, label, path, onClick, danger }) => {
          const active = path ? isActive(path) : false;
          return (
            <button
              key={label}
              onClick={onClick}
              className="w-full flex items-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left"
              style={
                active
                  ? {
                      background: "rgba(124,58,237,0.10)",
                      color: "#7C3AED",
                      borderLeft: "3px solid #7C3AED",
                      paddingLeft: "calc(0.75rem - 3px)",
                      paddingRight: "0.75rem",
                    }
                  : {
                      color: danger ? "#DC2626" : "#6B7280",
                      paddingLeft: "0.75rem",
                      paddingRight: "0.75rem",
                    }
              }
            >
              <Icon
                className="flex-shrink-0"
                style={{
                  width: "1rem",
                  height: "1rem",
                  strokeWidth: active ? 2.5 : 1.75,
                  color: active ? "#7C3AED" : danger ? "#DC2626" : "#9CA3AF",
                }}
              />
              <span style={{ fontWeight: active ? 600 : 500 }}>{label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
