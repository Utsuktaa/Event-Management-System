import { useState, useEffect } from "react";
import axios from "axios";
import { Clock, MapPin } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";

export default function RegisteredEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistered = async () => {
      const token = getTokenFromCookies();
      if (!token) return;

      try {
        const res = await axios.get(
          "http://localhost:5000/api/events/registrations",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setEvents(res.data.events || []);
        console.log("Registered events API response:", res.data);
      } catch (err) {
        console.error("Failed to fetch registered events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistered();
  }, []);

  if (loading) return <p className="text-white p-8">Loading...</p>;
  if (!events.length)
    return <p className="text-white p-8">No registered events found.</p>;

  return (
    <div className="min-h-screen bg-purple-950 text-white font-poppins p-8">
      <h1 className="text-4xl font-pixel mb-8">My Registered Events</h1>
      <div className="space-y-6">
        {events.map((event) => (
          <div
            key={event._id}
            className="p-6 border border-blue-400 bg-purple-900 rounded"
          >
            <h2 className="font-pixel text-2xl mb-2">{event.title}</h2>
            <div className="flex flex-wrap gap-6 text-lg mb-2">
              <span className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-400" />
                {new Date(event.date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                {event.location}
              </span>
            </div>
            <p className="text-lg">{event.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
