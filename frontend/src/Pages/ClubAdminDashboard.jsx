import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { CalendarPlus, X, Clock, MapPin } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { useNavigate } from "react-router-dom";


//Toast
function Toast({ message, type, onClose }) {
  return (
    <div
      className={`fixed top-5 right-5 flex items-center justify-between gap-4 p-4 rounded shadow-lg min-w-[250px] text-white ${
        type === "success" ? "bg-blue-400" : "bg-red-400"
      }`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="p-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ClubAdminCreateEvent() {
  const { clubId } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState("club");
  const [imageFile, setImageFile] = useState(null);
  const { eventId } = useParams();
  const navigate = useNavigate();


  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loading, setLoading] = useState(false);

  const [editingEventId, setEditingEventId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success", duration = 4000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/events/club/${clubId}`
      );
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [clubId]);

  /* ---------- Submit (Create / Update) ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = getTokenFromCookies();
      if (!token) throw new Error("Not logged in");

      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
        );

        const cloudRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          formData
        );

        imageUrl = cloudRes.data.secure_url;
      }

      const payload = {
        title,
        description,
        date,
        location,
        visibility,
        clubId,
        imageUrl,
      };

      if (editingEventId) {
        await axios.put(
          `http://localhost:5000/api/events/${editingEventId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showToast("Event updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/events", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Event created successfully");
      }

      resetForm();
      fetchEvents();
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || "Event action failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingEventId(event._id);
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date.slice(0, 10));
    setLocation(event.location);
    setVisibility(event.visibility);
    setImageFile(null);
  };

  const resetForm = () => {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setLocation("");
    setVisibility("club");
    setImageFile(null);
  };

  return (
    <div className="min-h-screen bg-purple-950 text-white flex flex-col sm:flex-row gap-8 px-6 py-16">
      {/* ---------- Form ---------- */}
      <div className="w-full max-w-xl border border-blue-400 p-8 rounded-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 border-4 border-blue-400 rounded-md">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <h1 className="font-pixel text-3xl uppercase">
            {editingEventId ? "Edit Event" : "Create Event"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
            required
            className="w-full p-3 bg-purple-900 border border-blue-400 rounded"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Description"
            className="w-full p-3 bg-purple-900 border border-blue-400 rounded"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full p-3 bg-purple-900 border border-blue-400 rounded"
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="w-full p-3 bg-purple-900 border border-blue-400 rounded"
          />

          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full p-3 bg-purple-900 border border-blue-400 rounded"
          >
            <option value="club">Club Only</option>
            <option value="school">School Wide</option>
          </select>

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full"
          />

          <button
            disabled={loading}
            className="w-full py-3 border border-blue-400 font-pixel uppercase hover:bg-blue-400 hover:text-purple-950"
          >
            {loading
              ? editingEventId
                ? "Updating..."
                : "Creating..."
              : editingEventId
              ? "Update Event"
              : "Create Event"}
          </button>

          {editingEventId && (
            <button
              type="button"
              onClick={resetForm}
              className="w-full py-2 border border-red-400 font-pixel"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      {/* ---------- Events List ---------- */}
      <div className="w-full max-w-xl border border-blue-400 p-6 rounded-xl">
        <h2 className="font-pixel text-2xl mb-4">Current Events</h2>

        {loadingEvents ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <p>No events yet.</p>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                key={event._id}
                className="p-4 border border-blue-400 bg-purple-900 rounded flex justify-between"
              >
                <div>
                  <h3 className="font-pixel text-xl">{event.title}</h3>
                  <div className="text-sm text-gray-300 flex gap-4">
                    <span className="flex gap-1 items-center">
                      <Clock className="w-4 h-4" />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                    <span className="flex gap-1 items-center">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleEdit(event)}
                  className="px-3 py-1 border border-blue-400 font-pixel hover:bg-blue-400 hover:text-purple-950"
                >
                  Edit
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <button
        onClick={() => navigate(`/club-admin/${clubId}/requests`)}
        className="border border-blue-400 px-4 py-2 font-pixel"
      >
        View Join Requests
      </button>
    </div>
  );
}
