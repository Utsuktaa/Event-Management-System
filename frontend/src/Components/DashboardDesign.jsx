import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Users, BarChart2, MapPin, Clock, Activity } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);

  const cards = [
    { icon: Calendar,  title: "Attendance",        desc: "Track your presence" },
    { icon: Users,     title: "Stats",             desc: "XP, badges & ranks" },
    { icon: BarChart2, title: "Join Clubs",         desc: "Unlock club events" },
    { icon: Activity,  title: "Activity Timeline",  desc: "Your recent activity" },
  ];

  useEffect(() => {
    const token = getTokenFromCookies();

    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/events/school-events`);
        const now = new Date();
        setEvents((res.data || []).filter((e) => new Date(e.date) >= now));
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoadingEvents(false);
      }
    };

    const fetchRegistered = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/api/events/registrations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRegisteredEvents(res.data.events?.map((e) => e?._id).filter(Boolean) || []);
      } catch (err) {
        console.error("Failed to fetch registrations:", err);
      }
    };

    fetchEvents();
    fetchRegistered();
  }, []);

  const handleCardClick = (title) => {
    if (title === "Attendance")        navigate("/attendance");
    if (title === "Stats")             navigate("/stats");
    if (title === "Join Clubs")        navigate("/join-clubs");
    if (title === "Activity Timeline") navigate("/activity");
  };

  const toggleExpand = (id) => setExpandedEvent(expandedEvent === id ? null : id);

  const handleRegister = async (e, eventId, isRegistered) => {
    e.stopPropagation();
    if (!eventId || isRegistered) return;
    const token = getTokenFromCookies();
    if (!token) return;
    try {
      await axios.post(
        `${API_BASE}/api/events/${eventId}/register`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRegisteredEvents((prev) => [...prev, eventId]);
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (err.response?.status === 400 && msg === "Already registered") {
        setRegisteredEvents((prev) => [...prev, eventId]);
      } else if (err.response?.status === 400 && msg.includes("full")) {
        // Refresh events to show updated count
        const res = await axios.get(`${API_BASE}/api/events/school-events`);
        const now = new Date();
        setEvents((res.data || []).filter((ev) => new Date(ev.date) >= now));
      } else {
        alert(msg || "Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="font-sans text-gray-900">
      <div className="max-w-[1100px] mx-auto px-6 py-10 space-y-10">

        <section>
          <h2 className="text-xl font-bold mb-5" style={{ color: "#1E3A8A" }}>Upcoming Events</h2>

          {loadingEvents ? (
            <p className="text-sm text-gray-500">Loading events…</p>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-sm">No upcoming events right now.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => {
                const isExpanded = expandedEvent === event._id;
                const isRegistered = registeredEvents.includes(event._id);
                const cap = event.registrationCap;
                const count = event.registrationCount || 0;
                const isFull = cap != null && count >= cap;
                const spotsLeft = cap != null ? cap - count : null;
                return (
                  <div
                    key={event._id}
                    onClick={() => toggleExpand(event._id)}
                    className="bg-white rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-sm transition-all duration-150 p-5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-gray-900">{event.title}</h3>
                      {cap != null && (
                        <span className={`flex-shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          isFull
                            ? "bg-red-50 text-red-500 border-red-200"
                            : spotsLeft <= 5
                              ? "bg-orange-50 text-orange-500 border-orange-200"
                              : "bg-purple-50 text-purple-600 border-purple-200"
                        }`}>
                          {isFull ? "Full" : `${count}/${cap} spots`}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-5 text-sm text-gray-500 mt-1.5">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-purple-400" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        {event.location}
                      </span>
                    </div>
                    {isExpanded && (
                      <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-3">
                          <p className="text-sm text-gray-600">{event.description}</p>
                          {cap != null && (
                            <div className="w-full bg-purple-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-red-400" : "bg-purple-500"}`}
                                style={{ width: `${Math.min(100, (count / cap) * 100)}%` }}
                              />
                            </div>
                          )}
                          <button
                            disabled={isRegistered || isFull}
                            onClick={(e) => handleRegister(e, event._id, isRegistered)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 w-fit ${
                              isRegistered
                                ? "bg-purple-100 text-purple-500 cursor-not-allowed"
                                : isFull
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : "bg-purple-600 text-white hover:bg-purple-700"
                            }`}
                          >
                            {isRegistered ? "Registered" : isFull ? "Event full" : "Register"}
                          </button>
                        </div>
                        {event.imageUrl && (
                          <div className="flex-shrink-0 self-start">
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              loading="lazy"
                              className="w-[4.5cm] h-[6.5cm] object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-base font-semibold mb-4" style={{ color: "#374151" }}>Quick Actions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                onClick={() => handleCardClick(title)}
                className="flex items-center gap-3 bg-white rounded-xl border border-purple-100 hover:border-purple-300 hover:shadow-sm transition-all duration-150 px-4 py-3 cursor-pointer"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(124,58,237,0.08)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#7C3AED" }} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{title}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
