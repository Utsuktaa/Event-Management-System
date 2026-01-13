import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Users,
  FileText,
  BarChart2,
  MapPin,
  Clock,
} from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";

export default function DashboardDesign() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [showRegisteredOnly, setShowRegisteredOnly] = useState(false);

  const cards = [
    { icon: Calendar, title: "Attendance", desc: "View your attendance" },
    { icon: Users, title: "Leaderboard", desc: "View badges and points" },
    {
      icon: FileText,
      title: "View Events",
      desc: "View events you have registered",
    },
    {
      icon: BarChart2,
      title: "Join Clubs",
      desc: "Join a club to view club-only events",
    },
  ];

  // Fetch all school events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/events/school-events"
        );
        setEvents(res.data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const fetchRegistered = async () => {
    const token = getTokenFromCookies();
    if (!token) return;

    try {
      const res = await axios.get(
        "http://localhost:5000/api/events/registrations", 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRegisteredEvents(res.data.events.map((e) => e._id));
    } catch (err) {
      console.error("Failed to fetch registrations:", err);
    }
  };

  useEffect(() => {
    fetchRegistered();
  }, []);

  const handleCardClick = (title) => {
    if (title === "Join Clubs") navigate("/join-clubs");
    if (title === "View Events") navigate("/my-events");
  };

  const toggleExpand = (eventId) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  // Determine which events to display
  const displayedEvents = showRegisteredOnly
    ? events.filter((e) => registeredEvents.includes(e._id))
    : events;

  return (
    <div className="min-h-screen bg-purple-950 relative overflow-hidden font-poppins text-white">
      <div className="fixed inset-0 scanlines pointer-events-none z-10" />

      <div className="relative z-20 max-w-6xl mx-auto px-6 py-12">
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-blue-400" />
            <h2 className="font-pixel text-4xl uppercase tracking-wider">
              Upcoming Events
            </h2>
            <div className="h-1 flex-1 bg-blue-400" />
          </div>

          {loadingEvents ? (
            <p className="text-center font-pixel text-xl">Loading events...</p>
          ) : displayedEvents.length === 0 ? (
            <p className="text-center font-pixel text-xl">
              {showRegisteredOnly
                ? "You have not registered for any events."
                : "No events available."}
            </p>
          ) : (
            <div className="space-y-6">
              {displayedEvents.map((event, i) => {
                const isExpanded = expandedEvent === event._id;
                return (
                  <div
                    key={event._id}
                    className={`p-6 border border-blue-400 bg-purple-950 cursor-pointer group transition-transform hover:translate-x-1 hover:-translate-y-1 flex flex-col sm:flex-row gap-4 ${
                      isExpanded ? "bg-purple-900" : ""
                    }`}
                    style={{ animationDelay: `${i * 150}ms` }}
                    onClick={() => toggleExpand(event._id)}
                  >
                    <div className="flex-1">
                      <h3 className="font-pixel text-3xl mb-2">
                        {event.title}
                      </h3>
                      <div className="flex flex-wrap gap-6 font-pixel text-xl mb-2">
                        <span className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-400" />
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-blue-400" />
                          {event.location}
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="space-y-4 mt-4">
                          <p className="font-pixel text-lg">
                            {event.description}
                          </p>
                          <button
                            disabled={registeredEvents.includes(event._id)}
                            onClick={async (e) => {
                              e.stopPropagation();
                              const token = getTokenFromCookies();
                              try {
                                await axios.post(
                                  `http://localhost:5000/api/events/${event._id}/register`,
                                  {},
                                  {
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  }
                                );
                                setRegisteredEvents([
                                  ...registeredEvents,
                                  event._id,
                                ]);
                              } catch (err) {
                                alert(
                                  err.response?.data?.message ||
                                    "Registration failed"
                                );
                              }
                            }}
                            className={`px-4 py-2 border border-blue-400 font-pixel text-lg uppercase ${
                              registeredEvents.includes(event._id)
                                ? "bg-gray-500 text-white cursor-not-allowed"
                                : "hover:bg-blue-400 hover:text-purple-950 transition"
                            }`}
                          >
                            {registeredEvents.includes(event._id)
                              ? "Registered"
                              : "Register"}
                          </button>
                        </div>
                      )}
                    </div>

                    {isExpanded && event.imageUrl && (
                      <div className="flex-shrink-0">
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          loading="lazy"
                          className="w-[5cm] h-[7cm] object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-blue-400" />
            <h2 className="font-pixel text-4xl uppercase tracking-wider">
              ★ Quick Actions ★
            </h2>
            <div className="h-1 flex-1 bg-blue-400" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cards.map(({ icon: Icon, title, desc }, i) => (
              <div
                key={title}
                onClick={() => handleCardClick(title)}
                className="p-8 cursor-pointer border border-blue-400 bg-purple-950 transition-all duration-200 hover:translate-x-2 hover:-translate-y-2"
                style={{ animationDelay: `${(i + 3) * 150}ms` }}
              >
                <div className="inline-flex p-4 border-4 border-blue-400 mb-6">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-pixel text-3xl mb-2">{title}</h3>
                <p className="text-lg">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
