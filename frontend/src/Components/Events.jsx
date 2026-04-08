import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, MapPin } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";

export default function Events({ clubId }) {
  const token = getTokenFromCookies();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/events/club/${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
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
        console.error(err);
      }
    };

    fetchEvents();
    fetchRegistered();
  }, [clubId]);

  const handleRegister = async (e, eventId, isRegistered) => {
    e.stopPropagation();
    if (!eventId || isRegistered || !token) return;
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

  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const upcoming = events.filter((e) => new Date(e.date) >= now);
  const past = events.filter(
    (e) => new Date(e.date) < now && new Date(e.date) >= cutoff
  );

  const renderEventCard = (event, isPast = false) => {
    const isExpanded = expandedEvent === event._id;
    const isRegistered = registeredEvents.includes(event._id);

    return (
      <div
        key={event._id}
        onClick={() => setExpandedEvent(isExpanded ? null : event._id)}
        className="relative bg-white rounded-3xl border border-purple-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-150 p-6 cursor-pointer overflow-hidden"
        style={isPast ? { opacity: 0.75 } : {}}
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-200 rounded-full opacity-40 pointer-events-none" />
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
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
              {!isPast && (
                <button
                  disabled={isRegistered}
                  onClick={(e) => handleRegister(e, event._id, isRegistered)}
                  className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-150 ${
                    isRegistered
                      ? "bg-purple-100 text-purple-500 cursor-not-allowed"
                      : "bg-purple-400 text-white hover:bg-purple-500 active:scale-95 shadow-sm hover:shadow-md"
                  }`}
                  style={{ width: "fit-content" }}
                >
                  {isRegistered ? "You're in!" : "Join the fun"}
                </button>
              )}
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
  };

  if (loading) {
    return <p className="text-sm text-gray-500 py-6">Loading events…</p>;
  }

  return (
    <div className="space-y-10 mt-4">
      <div className="bg-white/80 rounded-3xl p-8 border border-purple-200 shadow-sm space-y-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
        <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming events.</p>
        ) : (
          <div className="space-y-6">
            {upcoming.map((event) => renderEventCard(event, false))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div className="bg-white/80 rounded-3xl p-8 border border-purple-200 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-200 rounded-full opacity-30 pointer-events-none" />
          <h2 className="text-xl font-bold text-gray-500">Recent Past Events</h2>
          <p className="text-xs text-gray-400 -mt-4">Last 30 days</p>
          <div className="space-y-6">
            {past.map((event) => renderEventCard(event, true))}
          </div>
        </div>
      )}
    </div>
  );
}
