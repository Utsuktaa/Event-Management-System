import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { API_BASE } from "../config";
import Logo from "../Components/Logo";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const COLORS = ["#7c3aed", "#4f46e5", "#a78bfa", "#c4b5fd"];

function StatCard({ label, value, sub }) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-1"
      style={{
        background: "rgba(255,255,255,0.75)",
        border: "1px solid rgba(124,58,237,0.12)",
        boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
      }}
    >
      <p
        className="text-xs font-medium uppercase tracking-wide"
        style={{ color: "#9CA3AF" }}
      >
        {label}
      </p>
      <p className="text-3xl font-bold" style={{ color: "#1E3A8A" }}>
        {value}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: "#9CA3AF" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

const chartCard = {
  background: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(124,58,237,0.12)",
  boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
};

export default function AttendanceAnalytics() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [visibility, setVisibility] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((r) => r.startsWith("token="))
      ?.split("=")[1];
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_BASE}/api/events/analytics/overview`, { headers }).then(
        (r) => r.json(),
      ),
      fetch(`${API_BASE}/api/events/analytics/monthly`, { headers }).then((r) =>
        r.json(),
      ),
      fetch(`${API_BASE}/api/events/analytics/visibility`, { headers }).then(
        (r) => r.json(),
      ),
    ])
      .then(([ov, mo, vi]) => {
        setOverview(ov);
        setMonthly(mo);
        setVisibility(vi);
      })
      .catch(() => setError("Failed to load analytics data."))
      .finally(() => setLoading(false));
  }, []);

  const pageShell = (children) => (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg,#ede9fe 0%,#f5f3ff 40%,#e0e7ff 100%)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(circle,#c4b5fd,transparent 70%)",
          }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{
            background: "radial-gradient(circle,#a5b4fc,transparent 70%)",
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
      {children}
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

  if (loading)
    return pageShell(
      <div className="flex items-center justify-center py-40">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }}
        />
      </div>,
    );

  if (error)
    return pageShell(
      <div className="flex items-center justify-center py-40">
        <p className="text-sm" style={{ color: "#EF4444" }}>
          {error}
        </p>
      </div>,
    );

  const topEvents = [...overview.eventBreakdown]
    .sort((a, b) => b.attended - a.attended)
    .slice(0, 5);
  const rateData = [...overview.eventBreakdown]
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 5)
    .map((e) => ({
      name: e.name.length > 18 ? e.name.slice(0, 18) + "…" : e.name,
      rate: e.attendanceRate,
    }));

  return pageShell(
    <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-1 h-8 rounded-full"
          style={{ background: "linear-gradient(180deg,#7C3AED,#4f46e5)" }}
        />
        <h1 className="text-3xl font-bold" style={{ color: "#1E3A8A" }}>
          Attendance Analytics
        </h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Events" value={overview.totalEvents} />
        <StatCard label="Registrations" value={overview.totalRegistrations} />
        <StatCard label="Attendances" value={overview.totalAttendance} />
        <StatCard
          label="Attendance Rate"
          value={`${overview.overallAttendanceRate}%`}
          sub="attended / registered"
        />
      </div>

      <div className="rounded-2xl p-6" style={chartCard}>
        <p className="text-sm font-semibold mb-4" style={{ color: "#1E3A8A" }}>
          Monthly Trend — Last 6 Months
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthly}>
            <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(124,58,237,0.15)",
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="events"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Events"
            />
            <Line
              type="monotone"
              dataKey="attendance"
              stroke="#4f46e5"
              strokeWidth={2}
              dot={{ r: 4 }}
              name="Attendance"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl p-6" style={chartCard}>
          <p
            className="text-sm font-semibold mb-4"
            style={{ color: "#1E3A8A" }}
          >
            Top 5 Events by Attendance
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart layout="vertical" data={topEvents} margin={{ left: 10 }}>
              <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9ca3af"
                width={140}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) =>
                  v.length > 20 ? v.slice(0, 20) + "…" : v
                }
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(124,58,237,0.15)",
                }}
              />
              <Bar
                dataKey="attended"
                fill="#7c3aed"
                radius={[0, 6, 6, 0]}
                name="Attended"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl p-6" style={chartCard}>
          <p
            className="text-sm font-semibold mb-4"
            style={{ color: "#1E3A8A" }}
          >
            Event Type
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={visibility}
                dataKey="value"
                nameKey="name"
                outerRadius={85}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {visibility.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid rgba(124,58,237,0.15)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={chartCard}>
        <p className="text-sm font-semibold mb-4" style={{ color: "#1E3A8A" }}>
          Attendance Rate by Event (Top 5)
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={rateData}>
            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip
              formatter={(v) => `${v}%`}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(124,58,237,0.15)",
              }}
            />
            <Bar
              dataKey="rate"
              fill="#4f46e5"
              radius={[6, 6, 0, 0]}
              name="Rate %"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl overflow-hidden" style={chartCard}>
        <table className="w-full text-sm text-left">
          <thead style={{ background: "rgba(124,58,237,0.06)" }}>
            <tr>
              {["Event", "Date", "Type", "Registered", "Attended", "Rate"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7C3AED" }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {overview.eventBreakdown.map((e) => (
              <tr
                key={e.id}
                className="border-t transition"
                style={{ borderColor: "rgba(124,58,237,0.08)" }}
                onMouseEnter={(el) =>
                  (el.currentTarget.style.background = "rgba(124,58,237,0.03)")
                }
                onMouseLeave={(el) => (el.currentTarget.style.background = "")}
              >
                <td
                  className="px-5 py-3 font-medium"
                  style={{ color: "#1E3A8A" }}
                >
                  {e.name}
                </td>
                <td className="px-5 py-3" style={{ color: "#6B7280" }}>
                  {new Date(e.date).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={
                      e.visibility === "school"
                        ? {
                            background: "rgba(124,58,237,0.1)",
                            color: "#7C3AED",
                          }
                        : {
                            background: "rgba(79,70,229,0.1)",
                            color: "#4f46e5",
                          }
                    }
                  >
                    {e.visibility}
                  </span>
                </td>
                <td
                  className="px-5 py-3 text-right"
                  style={{ color: "#6B7280" }}
                >
                  {e.registered}
                </td>
                <td
                  className="px-5 py-3 text-right"
                  style={{ color: "#6B7280" }}
                >
                  {e.attended}
                </td>
                <td
                  className="px-5 py-3 text-right font-semibold"
                  style={{
                    color:
                      e.attendanceRate >= 75
                        ? "#16a34a"
                        : e.attendanceRate >= 40
                          ? "#d97706"
                          : "#dc2626",
                  }}
                >
                  {e.attendanceRate}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>,
  );
}
