import { useState, useEffect } from "react";
import axios from "axios";
import { Clock, MapPin, CheckCircle, XCircle, Calendar } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";
import Sidebar from "../Components/Sidebar";

const FILTERS = ["All", "Upcoming", "Past"];

function statusOf(event) {
  const now = new Date();
  const isPast = new Date(event.date) < now;
  if (!isPast) return "upcoming";
  if (event.attended) return "attended";
  return "missed";
}

const STATUS_STYLE = {
  upcoming: { label: "Upcoming", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  attended: { label: "Attended", bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  missed:   { label: "Missed",   bg: "bg-gray-100",  text: "text-gray-500",  border: "border-gray-200" },
};

export default function RegisteredEvents() {
  const [events, setEvents] = useState([]);
  const [attendedIds, setAttendedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const token = getTokenFromCookies();
    if (!token) { setLoading(false); return; }

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      axios.get(`${API_BASE}/api/events/registrations`, { headers }),
      axios.get(`${API_BASE}/api/user/attendance-stats`, { headers }),
    ])
      .then(([regRes, attRes]) => {
        const raw = regRes.data.events || [];
        const ids = new Set(
          (attRes.data.events || [])
            .filter((e) => e.attended)
            .map((e) => e.title)
        );
        setAttendedIds(ids);
        setEvents(raw.filter(Boolean));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const enriched = events.map((e) => ({
    ...e,
    attended: attendedIds.has(e.title),
  }));

  const now = new Date();
  const filtered = enriched.filter((e) => {
    const isPast = new Date(e.date) < now;
    if (filter === "Upcoming") return !isPast;
    if (filter === "Past") return isPast;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aPast = new Date(a.date) < now;
    const bPast = new Date(b.date) < now;
    if (!aPast && bPast) return -1;
    if (aPast && !bPast) return 1;
    return new Date(a.date) - new Date(b.date);
  });

  return (
    <div
      className="min-h-screen font-sans flex"
      style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0f9ff 100%)" }}
    >
      <Sidebar role="user" />

      <div className="flex-1 flex flex-col ml-56">
        <header
          className="px-8 py-4 border-b"
          style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(124,58,237,0.08)" }}
        >
          <h1 className="text-lg font-semibold" style={{ color: "#1E3A8A" }}>My Events</h1>
        </header>

        <main className="flex-1 px-8 py-8">
          <div className="flex items-center gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors border"
                style={
                  filter === f
                    ? { background: "#7C3AED", color: "#fff", borderColor: "#7C3AED" }
                    : { background: "#fff", color: "#6B7280", borderColor: "rgba(124,58,237,0.15)" }
                }
              >
                {f}
              </button>
            ))}
            {!loading && (
              <span className="ml-auto text-xs text-gray-400">{sorted.length} event{sorted.length !== 1 ? "s" : ""}</span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-52 rounded-xl animate-pulse bg-white border border-purple-100" />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center py-24 gap-3">
              <Calendar className="w-10 h-10 text-purple-200 stroke-[1.5]" />
              <p className="text-sm text-gray-400">
                {filter === "All" ? "You haven't registered for any events yet." : `No ${filter.toLowerCase()} events.`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((event) => {
                const status = statusOf(event);
                const style = STATUS_STYLE[status];
                const dateStr = new Date(event.date).toLocaleDateString(undefined, {
                  month: "short", day: "numeric", year: "numeric",
                });
                const daysUntil = Math.ceil((new Date(event.date) - now) / (1000 * 60 * 60 * 24));

                return (
                  <div
                    key={event._id}
                    className="bg-white rounded-xl border border-purple-100 overflow-hidden flex flex-col hover:border-purple-300 hover:shadow-sm transition-all duration-150"
                  >
                    {event.imageUrl ? (
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        loading="lazy"
                        className="w-full h-36 object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-36 flex items-center justify-center"
                        style={{ background: "rgba(124,58,237,0.06)" }}
                      >
                        <Calendar className="w-8 h-8 text-purple-200 stroke-[1.5]" />
                      </div>
                    )}

                    <div className="p-4 flex flex-col gap-2 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{event.title}</h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border flex-shrink-0 ${style.bg} ${style.text} ${style.border}`}>
                          {style.label}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          {dateStr}
                          {status === "upcoming" && daysUntil >= 0 && (
                            <span className="text-purple-500 font-medium">
                              · {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `in ${daysUntil}d`}
                            </span>
                          )}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                            {event.location}
                          </span>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-xs text-gray-400 line-clamp-2 mt-auto pt-1">{event.description}</p>
                      )}

                      {status !== "upcoming" && (
                        <div className="flex items-center gap-1.5 mt-1">
                          {status === "attended"
                            ? <CheckCircle className="w-3.5 h-3.5 text-purple-500" />
                            : <XCircle className="w-3.5 h-3.5 text-gray-300" />
                          }
                          <span className={`text-xs font-medium ${status === "attended" ? "text-purple-500" : "text-gray-400"}`}>
                            {status === "attended" ? "Attendance recorded" : "Did not attend"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
