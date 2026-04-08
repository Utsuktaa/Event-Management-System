import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Calendar, CheckCircle, XCircle } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";
import Logo from "../Components/Logo";

export default function AttendancePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getTokenFromCookies();
    if (!token) return;
    axios
      .get(`${API_BASE}/api/user/attendance-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0f9ff 100%)" }}
    >
      <nav
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between bg-white/92 backdrop-blur-md border-b border-purple-100 shadow-sm"
      >
        <Logo />
        <button
          onClick={() => navigate("/user-dashboard")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-500 hover:bg-purple-50 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </nav>

      <div className="max-w-[700px] mx-auto px-6 py-12 space-y-8">

        {loading ? (
          <p className="text-sm text-gray-500">Loading your attendance…</p>
        ) : !stats ? (
          <p className="text-sm text-gray-500">Could not load attendance data.</p>
        ) : (
          <>
            <section className="bg-white/80 rounded-3xl p-8 border border-purple-200 shadow-sm relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-400 stroke-[2.5]" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Attendance</h1>
                  <p className="text-sm text-gray-400">Your past attendances</p>
                </div>
              </div>

              <div className="flex items-end justify-between mb-3">
                <span className="text-5xl font-bold text-purple-600">{stats.attendanceRate}%</span>
                <span className="text-sm text-gray-400">{stats.attended} / {stats.registered} events</span>
              </div>

              <div className="w-full h-3 bg-purple-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${stats.attendanceRate}%` }}
                />
              </div>
            </section>

            <section className="grid grid-cols-3 gap-4">
              {[
                { label: "Streak", value: stats.streak, sub: "in a row" },
                { label: "Missed", value: stats.missed, sub: "events" },
                { label: "Last " + stats.recentTotal, value: `${stats.recentAttended}/${stats.recentTotal}`, sub: "attended" },
              ].map(({ label, value, sub }) => (
                <div key={label} className="bg-white/80 rounded-3xl p-5 border border-purple-200 shadow-sm text-center relative overflow-hidden">
                  <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-purple-200 rounded-full opacity-20 pointer-events-none" />
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs font-semibold text-purple-500 mt-0.5">{label}</p>
                  <p className="text-xs text-gray-400">{sub}</p>
                </div>
              ))}
            </section>

            {stats.recentEvents.length > 0 && (
              <section className="bg-white/80 rounded-3xl p-6 border border-purple-200 shadow-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
                <h2 className="text-base font-bold text-gray-900 mb-4">Recent Performance</h2>
                <div className="flex gap-2 mb-4">
                  {stats.recentEvents.map((e, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className={`w-full h-2 rounded-full ${e.attended ? "bg-purple-500" : "bg-purple-100"}`} />
                      {e.attended
                        ? <CheckCircle className="w-3.5 h-3.5 text-purple-400 stroke-[2.5]" />
                        : <XCircle className="w-3.5 h-3.5 text-gray-300 stroke-[2.5]" />
                      }
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400">Past registered events</p>
              </section>
            )}

            {stats.events?.length > 0 && (
              <section className="bg-white/80 rounded-3xl p-6 border border-purple-200 shadow-sm relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
                <h2 className="text-base font-bold text-gray-900 mb-4">All Registered Events</h2>
                <div className="space-y-3">
                  {stats.events.map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-purple-100 bg-white">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          e.attended ? "bg-purple-100" : e.upcoming ? "bg-blue-50" : "bg-gray-100"
                        }`}>
                          {e.attended
                            ? <CheckCircle className="w-4 h-4 text-purple-500 stroke-[2.5]" />
                            : e.upcoming
                              ? <Calendar className="w-4 h-4 text-blue-400 stroke-[2.5]" />
                              : <XCircle className="w-4 h-4 text-gray-300 stroke-[2.5]" />
                          }
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{e.title}</p>
                          <p className="text-xs text-gray-400">{new Date(e.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        e.attended
                          ? "bg-purple-100 text-purple-600"
                          : e.upcoming
                            ? "bg-blue-50 text-blue-500"
                            : "bg-gray-100 text-gray-400"
                      }`}>
                        {e.attended ? "Attended" : e.upcoming ? "Upcoming" : "Missed"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
