import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";
import PageLayout from "../Components/PageLayout";

export default function AttendancePage() {
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
    <PageLayout title="Attendance" role="user">
      <div className="px-6 py-10">
        <div className="max-w-[700px] mx-auto space-y-8">
          {loading ? (
            <p className="text-sm text-gray-500">Loading your attendance…</p>
          ) : !stats ? (
            <p className="text-sm text-gray-500">Could not load attendance data.</p>
          ) : (
            <>
              <section className="bg-white rounded-xl p-6 border border-purple-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(124,58,237,0.08)" }}>
                    <Calendar className="w-5 h-5 text-purple-500 stroke-[2.5]" />
                  </div>
                  <div>
                    <h1 className="text-base font-bold text-gray-900">Attendance</h1>
                    <p className="text-xs text-gray-400">Your past attendances</p>
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

              <section className="grid grid-cols-2 gap-3">
                {[
                  { label: "Missed",                    value: stats.missed,                                    sub: "events"   },
                  { label: `Last ${stats.recentTotal}`, value: `${stats.recentAttended}/${stats.recentTotal}`,  sub: "attended" },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-white rounded-xl p-4 border border-purple-100 text-center">
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs font-semibold text-purple-500 mt-0.5">{label}</p>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                ))}
              </section>

              {stats.recentEvents.length > 0 && (
                <section className="bg-white rounded-xl p-5 border border-purple-100">
                  <h2 className="text-sm font-bold text-gray-900 mb-4">Recent Performance</h2>
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
                <section className="bg-white rounded-xl p-5 border border-purple-100">
                  <h2 className="text-sm font-bold text-gray-900 mb-4">All Registered Events</h2>
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
                          e.attended ? "bg-purple-100 text-purple-600"
                            : e.upcoming ? "bg-blue-50 text-blue-500"
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
    </PageLayout>
  );
}
