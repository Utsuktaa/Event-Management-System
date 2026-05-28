import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Shield,
  BarChart2,
  Flag,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";

const NAV_CARDS = [
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
];

const FLAG_LABEL = {
  spam: "Spam",
  harassment: "Harassment",
  scam: "Scam",
  other: "Other",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const token = getTokenFromCookies();
  const headers = { Authorization: `Bearer ${token}` };

  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      fetch(`${API_BASE}/api/admin/clubs`, { headers }).then((r) => r.json()),
      fetch(`${API_BASE}/api/events/school-events`).then((r) => r.json()),
      fetch(`${API_BASE}/api/events/analytics/overview`, { headers }).then(
        (r) => r.json(),
      ),
      fetch(`${API_BASE}/api/reports/admin/posts?limit=3`, { headers }).then(
        (r) => r.json(),
      ),
    ])
      .then(([clubs, events, analytics, reportData]) => {
        setStats({
          totalClubs: Array.isArray(clubs) ? clubs.length : 0,
          totalEvents: Array.isArray(events)
            ? events.length
            : analytics.totalEvents || 0,
          attendanceRate: analytics.overallAttendanceRate ?? null,
          pendingReports: reportData.total ?? 0,
        });
        setReports(reportData.posts?.slice(0, 3) || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        { label: "Total Clubs", value: stats.totalClubs },
        { label: "Total Events", value: stats.totalEvents },
        {
          label: "Attendance Rate",
          value:
            stats.attendanceRate !== null ? `${stats.attendanceRate}%` : "—",
        },
        {
          label: "Pending Reports",
          value: stats.pendingReports,
          alert: stats.pendingReports > 0,
        },
      ]
    : [];

  return (
    <div className="min-h-screen font-sans flex bg-gray-50">
      <Sidebar role="admin" />

      <div className="flex-1 flex flex-col ml-56">
        <header
          className="px-8 py-4 border-b bg-white border-purple-100"
        >
          <h1 className="text-lg font-semibold" style={{ color: "#1E3A8A" }}>
            Overview
          </h1>
        </header>

        <main className="flex-1 px-8 py-8">
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {loading
                ? [1, 2, 3, 4].map((n) => (
                    <div
                      key={n}
                      className="h-24 rounded-xl animate-pulse bg-white border border-purple-100"
                    />
                  ))
                : statCards.map(({ label, value, alert }) => (
                    <div
                      key={label}
                      className="bg-white rounded-xl border p-5 flex flex-col gap-1.5"
                      style={{
                        borderColor: alert
                          ? "rgba(220,38,38,0.2)"
                          : "rgba(124,58,237,0.10)",
                      }}
                    >
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        {label}
                      </span>
                      <span
                        className="text-2xl font-bold"
                        style={{ color: alert ? "#DC2626" : "#1E3A8A" }}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
            </div>

            {!loading && stats?.pendingReports > 0 && (
              <div className="bg-white rounded-xl border border-red-100 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-red-50">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-red-600">
                      {stats.pendingReports} pending report
                      {stats.pendingReports > 1 ? "s" : ""} need attention
                    </span>
                  </div>
                  <button
                    onClick={() => navigate("/moderation")}
                    className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    Review all
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {reports.length > 0 && (
                  <ul className="divide-y divide-gray-50">
                    {reports.map((post) => (
                      <li
                        key={post._id}
                        onClick={() => navigate("/moderation")}
                        className="flex items-start justify-between gap-4 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {post.title ||
                              post.description?.slice(0, 60) ||
                              "Untitled post"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {post.authorId?.name || "Unknown"} ·{" "}
                            {post.clubId?.name || ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {(post.flags || []).slice(0, 2).map((f) => (
                            <span
                              key={f}
                              className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100"
                            >
                              {FLAG_LABEL[f] || f}
                            </span>
                          ))}
                          <span className="text-xs text-gray-400">
                            {post.reportCount}×
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {!loading && stats?.pendingReports === 0 && (
              <div className="bg-white rounded-xl border border-purple-100 px-5 py-4 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: "rgba(5,150,105,0.08)" }}
                >
                  <Flag className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">
                  No pending reports — moderation queue is clear.
                </p>
              </div>
            )}

            {!loading && stats && (
              <div className="bg-white rounded-xl border border-purple-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-700">
                    Attendance summary
                  </span>
                  <button
                    onClick={() => navigate("/attendance-analytics")}
                    className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    View full analytics
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-end justify-between mb-1.5">
                      <span className="text-xs text-gray-400">
                        Overall rate
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: "#7C3AED" }}
                      >
                        {stats.attendanceRate !== null
                          ? `${stats.attendanceRate}%`
                          : "—"}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-700"
                        style={{ width: `${stats.attendanceRate ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Quick Access
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {NAV_CARDS.map(({ icon: Icon, title, desc, route }) => (
                  <div
                    key={title}
                    onClick={() => navigate(route)}
                    className="flex items-start gap-4 rounded-xl p-5 cursor-pointer transition-all duration-200 bg-white border hover:border-purple-300 hover:shadow-md"
                    style={{ border: "1px solid rgba(124,58,237,0.12)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "rgba(124,58,237,0.10)" }}
                    >
                      <Icon className="w-5 h-5" style={{ color: "#7C3AED" }} />
                    </div>
                    <div>
                      <h3
                        className="font-semibold text-sm mb-0.5"
                        style={{ color: "#1E3A8A" }}
                      >
                        {title}
                      </h3>
                      <p className="text-sm" style={{ color: "#6B7280" }}>
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        <footer
          className="py-6 text-center text-xs border-t"
          style={{
            color: "rgba(107,114,128,0.6)",
            borderColor: "rgba(124,58,237,0.10)",
          }}
        >
          © 2025 EventSync
        </footer>
      </div>
    </div>
  );
}
