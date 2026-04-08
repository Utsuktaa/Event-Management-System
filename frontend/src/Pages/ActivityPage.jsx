import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { ArrowLeft, Calendar, CheckCircle, Users, Activity, Clock, Star, MapPin, Inbox } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";
import Logo from "../Components/Logo";

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

export default function ActivityPage() {
  const navigate = useNavigate();
  const [activity, setActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(true);
  const [recommended, setRecommended] = useState([]);
  const [loadingRec, setLoadingRec] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);

  useEffect(() => {
    const token = getTokenFromCookies();

    const fetchActivity = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/api/user/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setActivity(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingActivity(false);
      }
    };

    const fetchRecommended = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE}/api/user/recommended-events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecommended(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRec(false);
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
        console.error(err);
      }
    };

    fetchActivity();
    fetchRecommended();
    fetchRegistered();
  }, []);

  const handleRegister = async (e, eventId) => {
    e.stopPropagation();
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
        alert(err.response?.data?.message || "Something went wrong.");
      }
    }
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0f9ff 100%)" }}
    >
      <nav
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 1px 16px rgba(124,58,237,0.07)",
          borderBottom: "1px solid rgba(124,58,237,0.08)",
        }}
      >
        <Logo />
        <button
          onClick={() => navigate("/user-dashboard")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all hover:bg-purple-50"
          style={{ color: "#6B7280" }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </nav>

      <div className="max-w-[900px] mx-auto px-6 py-12 space-y-12">

        <section className="bg-white/80 rounded-3xl p-8 border border-purple-200 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-400 stroke-[2.5]" />
            Activity Timeline
          </h1>

          {loadingActivity ? (
            <p className="text-sm text-gray-500">Loading your activity…</p>
          ) : activity.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <Inbox className="w-10 h-10 text-purple-200 stroke-[1.5]" />
              <p className="text-gray-500 text-sm">No recent activity. Join an event or club to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((item, i) => {
                const Icon = activityIcon[item.type] || Activity;
                return (
                  <div
                    key={i}
                    className="relative bg-white rounded-3xl border border-purple-200 shadow-sm p-4 overflow-hidden flex items-center gap-4"
                  >
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
              })}
            </div>
          )}
        </section>

        <section className="bg-white/80 rounded-3xl p-8 border border-purple-200 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-5 h-5 text-purple-400 stroke-[2.5]" />
            Recommended for You
          </h2>

          {loadingRec ? (
            <p className="text-sm text-gray-500">Finding events for you…</p>
          ) : recommended.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-3">
              <Star className="w-10 h-10 text-purple-200 stroke-[1.5]" />
              <p className="text-gray-500 text-sm">No recommendations right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommended.map((event) => {
                const isRegistered = registeredEvents.includes(event._id);
                const isExpanded = expandedEvent === event._id;
                return (
                  <div
                    key={event._id}
                    onClick={() => setExpandedEvent(isExpanded ? null : event._id)}
                    className="relative bg-white rounded-3xl border border-purple-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-150 p-6 cursor-pointer overflow-hidden"
                  >
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-200 rounded-full opacity-40 pointer-events-none" />
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-semibold text-gray-900">{event.title}</h3>
                      <span className="flex items-center gap-1 text-xs font-semibold text-purple-500 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 flex-shrink-0">
                        <Star className="w-3 h-3 stroke-[2.5]" />
                        For you
                      </span>
                    </div>
                    <div className="flex gap-6 text-sm text-gray-500 mt-2">
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400 stroke-[2.5]" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-purple-400 stroke-[2.5]" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    {isExpanded && (
                      <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 flex flex-col gap-2">
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <button
                            disabled={isRegistered}
                            onClick={(e) => handleRegister(e, event._id)}
                            className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-150 ${
                              isRegistered
                                ? "bg-purple-100 text-purple-500 cursor-not-allowed"
                                : "bg-purple-400 text-white hover:bg-purple-500 active:scale-95 shadow-sm hover:shadow-md"
                            }`}
                            style={{ width: "fit-content" }}
                          >
                            {isRegistered ? "Registered" : "Join the fun"}
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

      </div>
    </div>
  );
}
