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
      // Bump local count
      setEvents((prev) => prev.map((ev) =>
        ev._id === eventId ? { ...ev, registrationCount: (ev.registrationCount || 0) + 1 } : ev
      ));
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (err.response?.status === 400 && msg === "Already registered") {
        setRegisteredEvents((prev) => [...prev, eventId]);
      } else if (err.response?.status === 400 && msg.includes("full")) {
        // Refresh to get latest counts
        const res = await axios.get(`${API_BASE}/api/events/club/${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data || []);
      } else {
        alert(msg || "Something went wrong.");
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
    const cap = event.registrationCap;
    const count = event.registrationCount || 0;
    const isFull = cap != null && count >= cap;
    const spotsLeft = cap != null ? cap - count : null;

    return (
      <div
        key={event._id}
        onClick={() => setExpandedEvent(isExpanded ? null : event._id)}
        className="relative bg-white rounded-3xl border border-purple-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-150 p-6 cursor-pointer overflow-hidden"
        style={isPast ? { opacity: 0.75 } : {}}
      >
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-purple-200 rounded-full opacity-40 pointer-events-none" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
            {event.visibility === "school" ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                School Wide
              </span>
            ) : (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 border border-purple-200">
                Club Only
              </span>
            )}
          </div>
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
                <>
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
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition-all duration-150 ${
                      isRegistered
                        ? "bg-purple-100 text-purple-500 cursor-not-allowed"
                        : isFull
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-purple-400 text-white hover:bg-purple-500 active:scale-95 shadow-sm hover:shadow-md"
                    }`}
                    style={{ width: "fit-content" }}
                  >
                    {isRegistered ? "You're in!" : isFull ? "Event full" : "Join the fun"}
                  </button>
                </>
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
