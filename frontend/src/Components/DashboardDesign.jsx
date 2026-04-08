import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Users,
  BarChart2,
  MapPin,
  Clock,
  Activity,
  CheckCircle,
} from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";

const activityLabel = {
  event_joined: "Joined event",
  attendance: "Attended",
  club_join: "Joined club",
};

const activityIcon = {
  event_joined: Calendar,
  attendance: CheckCircle,
  club_join: Users,
};

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins || 1}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function ActivityItem({ item }) {
  const Icon = activityIcon[item.type] || Activity;
  return (
    <div className="relative bg-white rounded-3xl border border-purple-200 shadow-sm p-4 overflow-hidden flex items-center gap-4">
      <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-purple-200 rounded-full opacity-20 pointer-events-none" />
      {item.image ? (
        <img
          src={item.image}
          alt=""
          loading="lazy"
          className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-purple-400 stroke-[2.5]" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-purple-400 uppercase tracking-wide">
          {activityLabel[item.type] || item.type}
        </p>
        <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
      </div>
      <span className="text-xs text-gray-400 flex-shrink-0 flex items-center gap-1">
        <Clock className="w-3 h-3 text-purple-300 stroke-[2.5]" />
        {relativeTime(item.date)}
      </span>
    </div>
  );
}

export default function Dashboard() {  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [userClubIds, setUserClubIds] = useState([]);

  const cards = [
    { icon: Calendar, title: "Attendance", desc: "Track your presence" },
    { icon: Users, title: "Leaderboard", desc: "See your ranking" },
    { icon: BarChart2, title: "Join Clubs", desc: "Unlock club events" },
    { icon: Activity, title: "Activity Timeline", desc: "Your recent activity" },
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
        setRegisteredEvents(
          res.data.events?.map((e) => e?._id).filter(Boolean) || []
        );
      } catch (err) {
        console.error("Failed to fetch registrations:", err);
      }
    };

    fetchEvents();
    fetchRegistered();
  }, []);

  const handleCardClick = (title) => {
    if (title === "Join Clubs") navigate("/join-clubs");
    if (title === "Activity Timeline") navigate("/activity");
  };

  const toggleExpand = (id) =>
    setExpandedEvent(expandedEvent === id ? null : id);

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
      if (err.response?.status === 400 || err.response?.status === 409) {
        setRegisteredEvents((prev) => [...prev, eventId]);
      } else {
        alert(err.response?.data?.message || "Something went wrong. Try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-purple-50/40 font-poppins text-gray-900">
      <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-16">

        <section className="bg-white/80 rounded-3xl p-8 border border-purple-200 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
          <h1 className="text-3xl font-bold text-gray-900">Upcoming Events</h1>

          {loadingEvents ? (
            <p className="text-sm text-gray-500">Loading something exciting…</p>
          ) : events.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-5xl">🎈</div>
              <p className="text-gray-600 text-sm">It's quiet here… for now.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => {
                const isExpanded = expandedEvent === event._id;
                const isRegistered = registeredEvents.includes(event._id);

                return (
                  <div
                    key={event._id}
                    onClick={() => toggleExpand(event._id)}
                    className="relative bg-white rounded-3xl border border-purple-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-150 p-6 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-200 rounded-full opacity-40 pointer-events-none" />

                    <h3 className="text-lg font-semibold text-gray-900">
                      {event.title}
                    </h3>

                    <div className="flex gap-6 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400 stroke-[2.5]" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-400 stroke-[2.5]" />
                        {event.location}
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                          <p className="text-sm text-gray-600">
                            {event.description}
                          </p>
                          <button
                            disabled={isRegistered}
                            onClick={(e) =>
                              handleRegister(e, event._id, isRegistered)
                            }
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-150 ${
                              isRegistered
                                ? "bg-purple-100 text-purple-500 cursor-not-allowed"
                                : "bg-purple-400 text-white hover:bg-purple-500 active:scale-95 shadow-sm hover:shadow-md"
                            }`}
                            style={{ width: "fit-content" }}
                          >
                            {isRegistered ? "You're in! 🎉" : "Join the fun"}
                          </button>
                        </div>

                        {event.imageUrl && (
                          <div className="flex-shrink-0 self-start">
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              loading="lazy"
                              className="w-[4.5cm] h-[6.5cm] object-cover rounded-2xl"
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

        <section className="bg-purple-50/50 rounded-3xl p-8 border border-purple-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {cards.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                onClick={() => handleCardClick(title)}
                className="relative bg-white rounded-3xl border border-purple-200 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all duration-150 p-6 cursor-pointer overflow-hidden"
              >
                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-purple-200 rounded-full opacity-20 pointer-events-none" />
                <div className="w-12 h-12 rounded-2xl bg-purple-200 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-purple-400 stroke-[2.5]" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
