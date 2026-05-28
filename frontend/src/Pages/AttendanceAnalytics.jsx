import { useEffect, useState, useMemo } from "react";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { API_BASE } from "../config";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Search,
  Download,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import Sidebar from "../Components/Sidebar";

const COLORS = ["#7c3aed", "#4f46e5", "#a78bfa", "#c4b5fd"];
const fmt = (d) => d.toISOString().slice(0, 10);
const todayStr = fmt(new Date());
const defaultFromStr = (() => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return fmt(d);
})();
const RANGE_PRESETS = [
  { label: "7 days", value: "7" },
  { label: "30 days", value: "30" },
  { label: "90 days", value: "90" },
  { label: "Custom", value: "custom" },
];

function RangeFilter({ dateFrom, dateTo, preset, onPreset, onFrom, onTo }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Calendar className="w-4 h-4 text-purple-400 flex-shrink-0" />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        Range:
      </span>
      {RANGE_PRESETS.map((p) => (
        <button
          key={p.value}
          onClick={() => onPreset(p.value)}
          className="px-3 py-1 rounded-lg text-xs font-medium transition"
          style={
            preset === p.value
              ? {
                  background: "linear-gradient(135deg,#1E3A8A,#7C3AED)",
                  color: "#fff",
                }
              : { background: "rgba(124,58,237,0.08)", color: "#7C3AED" }
          }
        >
          {p.label}
        </button>
      ))}
      {preset === "custom" && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            max={dateTo}
            onChange={(e) => onFrom(e.target.value)}
            className="px-2 py-1 rounded-lg text-xs text-gray-700 outline-none border"
            style={{ borderColor: "rgba(124,58,237,0.2)" }}
          />
          <span className="text-xs text-gray-400">to</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            max={todayStr}
            onChange={(e) => onTo(e.target.value)}
            className="px-2 py-1 rounded-lg text-xs text-gray-700 outline-none border"
            style={{ borderColor: "rgba(124,58,237,0.2)" }}
          />
        </div>
      )}
      {preset !== "custom" && (
        <span className="text-xs text-gray-400">
          {dateFrom} to {dateTo}
        </span>
      )}
    </div>
  );
}

function useRangeFilter(defaultPreset = "30") {
  const [preset, setPreset] = useState(defaultPreset);
  const [dateFrom, setDateFrom] = useState(defaultFromStr);
  const [dateTo, setDateTo] = useState(todayStr);
  const applyPreset = (p) => {
    setPreset(p);
    if (p !== "custom") {
      const d = new Date();
      const f = new Date(d);
      f.setDate(d.getDate() - parseInt(p, 10));
      setDateFrom(fmt(f));
      setDateTo(fmt(d));
    }
  };
  return { preset, dateFrom, dateTo, applyPreset, setDateFrom, setDateTo };
}

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

const cc = {
  background: "rgba(255,255,255,0.75)",
  border: "1px solid rgba(124,58,237,0.12)",
  boxShadow: "0 2px 16px rgba(124,58,237,0.07)",
};
const tt = {
  contentStyle: { borderRadius: 12, border: "1px solid rgba(124,58,237,0.15)" },
};

export default function AttendanceAnalytics() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [visibility, setVisibility] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const topRange = useRangeFilter("30");
  const rateRange = useRangeFilter("30");
  const radarRange = useRangeFilter("30");
  const tableRange = useRangeFilter("30");
  const [tableSearch, setTableSearch] = useState("");
  const [tableSearchInput, setTableSearchInput] = useState("");

  const token = document.cookie
    .split("; ")
    .find((r) => r.startsWith("token="))
    ?.split("=")[1];

  useEffect(() => {
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

  const filterByRange = (events, from, to) => {
    if (!events) return [];
    const f = new Date(from);
    const t = new Date(to);
    t.setHours(23, 59, 59, 999);
    return events.filter((e) => {
      const d = new Date(e.date);
      return d >= f && d <= t;
    });
  };

  const topEvents = useMemo(
    () =>
      [
        ...filterByRange(
          overview?.eventBreakdown,
          topRange.dateFrom,
          topRange.dateTo,
        ),
      ]
        .sort((a, b) => b.attended - a.attended)
        .slice(0, 5),
    [overview, topRange.dateFrom, topRange.dateTo],
  );

  const rateData = useMemo(
    () =>
      [
        ...filterByRange(
          overview?.eventBreakdown,
          rateRange.dateFrom,
          rateRange.dateTo,
        ),
      ]
        .sort((a, b) => b.attendanceRate - a.attendanceRate)
        .slice(0, 5)
        .map((e) => ({
          name: e.name.length > 18 ? e.name.slice(0, 18) + "..." : e.name,
          rate: e.attendanceRate,
        })),
    [overview, rateRange.dateFrom, rateRange.dateTo],
  );

  const radarData = useMemo(
    () =>
      [
        ...filterByRange(
          overview?.eventBreakdown,
          radarRange.dateFrom,
          radarRange.dateTo,
        ),
      ]
        .sort((a, b) => b.registered - a.registered)
        .slice(0, 6)
        .map((e) => ({
          event: e.name.length > 14 ? e.name.slice(0, 14) + "..." : e.name,
          rate: e.attendanceRate,
          registered: e.registered,
          attended: e.attended,
        })),
    [overview, radarRange.dateFrom, radarRange.dateTo],
  );

  const trendData = monthly; // backend always returns last 6 months, use as-is

  const tableData = useMemo(() => {
    const rf = filterByRange(
      overview?.eventBreakdown,
      tableRange.dateFrom,
      tableRange.dateTo,
    );
    if (!tableSearch.trim()) return rf;
    const q = tableSearch.toLowerCase();
    return rf.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        (e.visibility || "").toLowerCase().includes(q),
    );
  }, [overview, tableRange.dateFrom, tableRange.dateTo, tableSearch]);

  const downloadCSV = (data, filename) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map((r) =>
      headers
        .map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`)
        .join(","),
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadJSON = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shell = (children) => (
    <div className="min-h-screen font-sans flex bg-gray-50">
      <Sidebar role="admin" />
      <div className="flex-1 flex flex-col ml-56">
        <header className="px-8 py-4 flex items-center gap-3 border-b bg-white border-purple-100">
          <button
            onClick={() => navigate("/admin-dashboard")}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-purple-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-semibold" style={{ color: "#1E3A8A" }}>
            Attendance Analytics
          </h1>
        </header>
        <div className="flex-1">{children}</div>
        <footer
          className="py-6 text-center text-xs border-t"
          style={{
            color: "rgba(107,114,128,0.6)",
            borderColor: "rgba(124,58,237,0.10)",
          }}
        >
          2025 EventSync
        </footer>
      </div>
    </div>
  );

  if (loading)
    return shell(
      <div className="flex items-center justify-center py-40">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }}
        />
      </div>,
    );

  if (error)
    return shell(
      <div className="flex items-center justify-center py-40">
        <p className="text-sm" style={{ color: "#EF4444" }}>
          {error}
        </p>
      </div>,
    );

  return shell(
    <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
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

      <div className="rounded-2xl p-6" style={cc}>
        <p className="text-sm font-semibold mb-4" style={{ color: "#1E3A8A" }}>
          Event Trend — Last 6 Months
        </p>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
            <Tooltip {...tt} />
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
        <div className="lg:col-span-2 rounded-2xl p-6" style={cc}>
          <p
            className="text-sm font-semibold mb-1"
            style={{ color: "#1E3A8A" }}
          >
            Top 5 Events by Attendance
          </p>
          <RangeFilter
            {...topRange}
            onPreset={topRange.applyPreset}
            onFrom={topRange.setDateFrom}
            onTo={topRange.setDateTo}
          />
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
                  v.length > 20 ? v.slice(0, 20) + "..." : v
                }
              />
              <Tooltip {...tt} />
              <Bar
                dataKey="attended"
                fill="#7c3aed"
                radius={[0, 6, 6, 0]}
                name="Attended"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-2xl p-6" style={cc}>
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
              <Tooltip {...tt} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={cc}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#1E3A8A" }}>
          Attendance Rate by Event (Top 5)
        </p>
        <RangeFilter
          {...rateRange}
          onPreset={rateRange.applyPreset}
          onFrom={rateRange.setDateFrom}
          onTo={rateRange.setDateTo}
        />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={rateData}>
            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 11 }} />
            <YAxis
              stroke="#9ca3af"
              tick={{ fontSize: 12 }}
              unit="%"
              domain={[0, 100]}
            />
            <Tooltip formatter={(v) => `${v}%`} {...tt} />
            <Bar
              dataKey="rate"
              fill="#4f46e5"
              radius={[6, 6, 0, 0]}
              name="Rate %"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl p-6" style={cc}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#1E3A8A" }}>
          Engagement Profile (Radar)
        </p>
        <RangeFilter
          {...radarRange}
          onPreset={radarRange.applyPreset}
          onFrom={radarRange.setDateFrom}
          onTo={radarRange.setDateTo}
        />
        {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(124,58,237,0.15)" />
              <PolarAngleAxis
                dataKey="event"
                tick={{ fontSize: 11, fill: "#6B7280" }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "#9CA3AF" }}
              />
              <Radar
                name="Attendance Rate %"
                dataKey="rate"
                stroke="#7c3aed"
                fill="#7c3aed"
                fillOpacity={0.25}
              />
              <Tooltip formatter={(v) => `${v}%`} {...tt} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 py-10 text-center">
            No data for selected range.
          </p>
        )}
      </div>

      <div className="rounded-2xl p-6" style={cc}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#1E3A8A" }}>
          Event Breakdown
        </p>
        <RangeFilter
          {...tableRange}
          onPreset={tableRange.applyPreset}
          onFrom={tableRange.setDateFrom}
          onTo={tableRange.setDateTo}
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setTableSearch(tableSearchInput);
          }}
          className="flex gap-2 mb-4"
        >
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={tableSearchInput}
              onChange={(e) => setTableSearchInput(e.target.value)}
              placeholder="Search event name or type..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm text-gray-800 bg-white placeholder-gray-400 outline-none border"
              style={{ borderColor: "rgba(124,58,237,0.2)" }}
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#1E3A8A,#7C3AED)" }}
          >
            Search
          </button>
          {tableSearch && (
            <button
              type="button"
              onClick={() => {
                setTableSearch("");
                setTableSearchInput("");
              }}
              className="px-3 py-2 rounded-xl text-sm text-gray-500 border hover:bg-gray-50 transition"
              style={{ borderColor: "rgba(124,58,237,0.2)" }}
            >
              Clear
            </button>
          )}
        </form>
        <div
          className="rounded-xl overflow-hidden border"
          style={{ borderColor: "rgba(124,58,237,0.12)" }}
        >
          <table className="w-full text-sm text-left">
            <thead style={{ background: "rgba(124,58,237,0.06)" }}>
              <tr>
                {[
                  "Event",
                  "Date",
                  "Type",
                  "Registered",
                  "Attended",
                  "Rate",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "#7C3AED" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-sm text-gray-400"
                  >
                    No events found.
                  </td>
                </tr>
              ) : (
                tableData.map((e) => (
                  <tr
                    key={e.id}
                    className="border-t transition"
                    style={{ borderColor: "rgba(124,58,237,0.08)" }}
                    onMouseEnter={(el) =>
                      (el.currentTarget.style.background =
                        "rgba(124,58,237,0.03)")
                    }
                    onMouseLeave={(el) =>
                      (el.currentTarget.style.background = "")
                    }
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={cc}>
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-4 h-4 text-purple-500" />
          <p className="text-sm font-semibold" style={{ color: "#1E3A8A" }}>
            Download Table
          </p>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Exports the current Event Breakdown table
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() =>
              downloadCSV(
                tableData.map((e) => ({
                  Event: e.name,
                  Date: new Date(e.date).toLocaleDateString(),
                  Type: e.visibility,
                  Registered: e.registered,
                  Attended: e.attended,
                  "Rate (%)": e.attendanceRate,
                })),
                "events-filtered.csv",
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition hover:border-purple-300 hover:shadow-sm bg-white"
            style={{ borderColor: "rgba(124,58,237,0.15)" }}
          >
            <FileSpreadsheet className="w-4 h-4" style={{ color: "#7C3AED" }} />
            Export filtered (CSV)
          </button>
          <button
            onClick={() =>
              downloadCSV(
                (overview?.eventBreakdown || []).map((e) => ({
                  Event: e.name,
                  Date: new Date(e.date).toLocaleDateString(),
                  Type: e.visibility,
                  Registered: e.registered,
                  Attended: e.attended,
                  "Rate (%)": e.attendanceRate,
                })),
                "events-all.csv",
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition hover:border-purple-300 hover:shadow-sm bg-white"
            style={{ borderColor: "rgba(124,58,237,0.15)" }}
          >
            <FileSpreadsheet className="w-4 h-4" style={{ color: "#7C3AED" }} />
            Export all events (CSV)
          </button>
          <button
            onClick={() =>
              downloadJSON(
                tableData.map((e) => ({
                  event: e.name,
                  date: new Date(e.date).toLocaleDateString(),
                  type: e.visibility,
                  registered: e.registered,
                  attended: e.attended,
                  attendanceRate: e.attendanceRate,
                })),
                "events-filtered.json",
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition hover:border-purple-300 hover:shadow-sm bg-white"
            style={{ borderColor: "rgba(124,58,237,0.15)" }}
          >
            <FileText className="w-4 h-4" style={{ color: "#7C3AED" }} />
            Export filtered (JSON)
          </button>
        </div>
      </div>
    </main>,
  );
}
