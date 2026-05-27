import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  House, Users, LogOut, UserCircle, Calendar, Activity,
  Shield, BarChart2, Flag, FileText, ClipboardList, Sparkles,
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
      { icon: Sparkles,      label: "Stats",      path: "/stats" },
      { icon: Activity,      label: "Activity",   path: "/activity" },
      { icon: ClipboardList, label: "Attendance", path: "/attendance" },
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
    ],
  },
];

export default function Sidebar({ role = "user" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const handleLogout = () => {
    clearAuthCookies();
    navigate("/login");
  };

  const groups = role === "admin" ? adminGroups : userGroups;
  const isActive = (path) => location.pathname === path;

  return (
    <>
    <aside className="fixed top-0 left-0 h-full w-56 flex flex-col z-50 bg-white border-r border-purple-100">
      <div className="px-5 py-5 border-b border-purple-100">
        <Logo />
      </div>

      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ icon: Icon, label, path }) => {
                const active = isActive(path);
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors text-left ${
                      active
                        ? "bg-purple-100 text-purple-700 border-l-[3px] border-purple-600 pl-[calc(0.75rem-3px)]"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className={`flex-shrink-0 w-4 h-4 ${active ? "text-purple-600" : "text-gray-400"}`}
                      strokeWidth={active ? 2.5 : 1.75}
                    />
                    <span className={active ? "font-semibold" : "font-medium"}>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-purple-100 space-y-0.5">
        <p className="px-3 mb-1 text-xs font-bold uppercase tracking-wider text-gray-400">Account</p>
        {(role === "admin"
          ? [
              { icon: LogOut, label: "Logout", path: null, onClick: () => setLogoutConfirm(true), danger: true },
            ]
          : [
              { icon: UserCircle, label: "Profile", path: "/profile", onClick: () => navigate("/profile"), danger: false },
              { icon: LogOut, label: "Logout", path: null, onClick: () => setLogoutConfirm(true), danger: true },
            ]
        ).map(({ icon: Icon, label, path, onClick, danger }) => {
          const active = path ? isActive(path) : false;
          return (
            <button
              key={label}
              onClick={onClick}
              className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors text-left ${
                active
                  ? "bg-purple-100 text-purple-700 border-l-[3px] border-purple-600 pl-[calc(0.75rem-3px)]"
                  : danger
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`flex-shrink-0 w-4 h-4 ${active ? "text-purple-600" : danger ? "text-red-500" : "text-gray-400"}`}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span className={active ? "font-semibold" : "font-medium"}>{label}</span>
            </button>
          );
        })}
      </div>
    </aside>

    {logoutConfirm && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30"
        onClick={() => setLogoutConfirm(false)}
      >
        <div
          className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-red-100"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-base font-bold text-gray-900 mb-2">Log out?</h3>
          <p className="text-sm text-gray-500 mb-5">
            You'll be signed out and redirected to the login page.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setLogoutConfirm(false)}
              className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}