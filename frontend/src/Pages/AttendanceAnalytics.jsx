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

const COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#ddd6fe"];

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-1">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-lg font-semibold text-gray-800 mb-4">{children}</h2>
  );
}

export default function AttendanceAnalytics() {
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

    async function load() {
      try {
        const [ovRes, moRes, viRes] = await Promise.all([
          fetch(`${API_BASE}/api/events/analytics/overview`, { headers }),
          fetch(`${API_BASE}/api/events/analytics/monthly`, { headers }),
          fetch(`${API_BASE}/api/events/analytics/visibility`, { headers }),
        ]);

        if (!ovRes.ok || !moRes.ok || !viRes.ok) {
          throw new Error("API request failed");
        }

        const [ov, mo, vi] = await Promise.all([
          ovRes.json(),
          moRes.json(),
          viRes.json(),
        ]);

        setOverview(ov);
        setMonthly(mo);
        setVisibility(vi);
      } catch (err) {
        console.error(err);
        setError("Failed to load analytics data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  // Top 5 events by attendance for bar chart
  const topEvents = overview
    ? [...overview.eventBreakdown]
        .sort((a, b) => b.attended - a.attended)
        .slice(0, 5)
    : [];

  // Attendance rate per event (top 5 by rate)
  const rateData = overview
    ? [...overview.eventBreakdown]
        .sort((a, b) => b.attendanceRate - a.attendanceRate)
        .slice(0, 5)
        .map((e) => ({
          name: e.name.length > 18 ? e.name.slice(0, 18) + "…" : e.name,
          rate: e.attendanceRate,
        }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Nav */}
      <nav className="px-6 py-4 flex justify-between items-center bg-white/60 backdrop-blur-md shadow-sm rounded-b-3xl">
        <h1 className="text-lg font-semibold text-purple-700">
          Attendance Analytics
        </h1>
        <p className="text-sm text-gray-400">Admin View</p>
      </nav>

      {/* Header */}
      <header className="py-10 text-center px-6 bg-linear-to-b from-purple-50 to-pink-50">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Event & Attendance Overview
        </h2>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-16 space-y-10">
        <section>
          <SectionTitle>Summary</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Events" value={overview.totalEvents} />
            <StatCard
              label="Total Registrations"
              value={overview.totalRegistrations}
            />
            <StatCard
              label="Total Attendances"
              value={overview.totalAttendance}
            />
            <StatCard
              label="Overall Attendance Rate"
              value={`${overview.overallAttendanceRate}%`}
            />
          </div>
        </section>

        {/* ── Monthly Trend ── */}
        <section>
          <SectionTitle>
            Monthly Trend — Events vs Attendance (Last 6 Months)
          </SectionTitle>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthly}>
                <XAxis
                  dataKey="month"
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip />
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
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Attendance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SectionTitle>Top 5 Events by Attendance</SectionTitle>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                layout="vertical"
                data={topEvents}
                margin={{ left: 10 }}
              >
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
                <Tooltip />
                <Bar
                  dataKey="attended"
                  fill="#7c3aed"
                  radius={[0, 4, 4, 0]}
                  name="Attended"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SectionTitle>Event Type</SectionTitle>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={visibility}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {visibility.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <SectionTitle>Attendance Rate by Event (Top 5)</SectionTitle>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={rateData}>
                <XAxis
                  dataKey="name"
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  stroke="#9ca3af"
                  tick={{ fontSize: 12 }}
                  unit="%"
                  domain={[0, 100]}
                />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar
                  dataKey="rate"
                  fill="#a78bfa"
                  radius={[4, 4, 0, 0]}
                  name="Rate %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <SectionTitle>All Events</SectionTitle>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-purple-50 text-purple-700 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-6 py-3">Event</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Visibility</th>
                  <th className="px-6 py-3 text-right">Registered</th>
                  <th className="px-6 py-3 text-right">Attended</th>
                  <th className="px-6 py-3 text-right">Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {overview.eventBreakdown.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3 font-medium text-gray-800">
                      {e.name}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(e.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          e.visibility === "school"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-pink-100 text-pink-700"
                        }`}
                      >
                        {e.visibility}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600">
                      {e.registered}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-600">
                      {e.attended}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          e.attendanceRate >= 75
                            ? "text-green-600"
                            : e.attendanceRate >= 40
                              ? "text-yellow-600"
                              : "text-red-500"
                        }`}
                      >
                        {e.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="py-10 text-center text-gray-400 text-sm border-t border-gray-200">
        &copy; 2025 EventSync
      </footer>
    </div>
  );
}
