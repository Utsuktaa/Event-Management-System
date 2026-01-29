import { useEffect, useState } from "react";
import axios from "axios";
import { Clock, MapPin } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";

function EventCard({ event }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setExpanded((v) => !v);
      }}
      className="bg-purple-900 rounded-xl border border-blue-400 overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
    >
      <div className="h-40 w-full overflow-hidden">
        <img
          src={event.imageUrl || "/placeholder.png"}
          alt={event.title}
          className="object-cover w-full h-full"
        />
      </div>

      <div className="p-4">
        <h3 className="font-pixel text-xl mb-2">{event.title}</h3>

        {expanded && (
          <div className="text-sm text-gray-300 space-y-2 mt-2">
            <p>{event.description}</p>

            <div className="flex gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(event.date).toLocaleString()}
              </span>

              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.location || "No location"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Events list
export default function Events({ clubId }) {
  const token = getTokenFromCookies();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/events/club/${clubId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setEvents(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [clubId]); 

  if (loading) return <p>Loading events...</p>;
  if (!events.length) return <p>No events yet.</p>;

  return (
    <div className="flex flex-wrap gap-6">
      {events.map((event) => (
        <div className="w-full sm:w-[48%] lg:w-[32%]">
          <EventCard event={event} />
        </div>
      ))}
    </div>
  );
}
