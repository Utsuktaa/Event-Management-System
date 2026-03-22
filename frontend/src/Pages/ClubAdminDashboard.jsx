import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { CalendarPlus, X, Clock, MapPin } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { API_BASE } from "../config";

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

// map component
function LocationSelector({ latLng, setLatLng, radius, setRadius }) {
  useMapEvents({
    click(e) {
      setLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return latLng.lat && latLng.lng ? (
    <>
      <Marker position={[latLng.lat, latLng.lng]} />
      <Circle
        center={[latLng.lat, latLng.lng]}
        radius={radius}
        pathOptions={{ color: "blue", fillOpacity: 0.2 }}
      />
    </>
  ) : null;
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
  const [latLng, setLatLng] = useState({ lat: null, lng: null });
  const [radius, setRadius] = useState(50); // default 50 meters
  const userJwt = getTokenFromCookies();
  const fetchEvents = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/events/club/${clubId}`,
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
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        );

        const cloudRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${
            import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
          }/image/upload`,
          formData,
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
        latitude: latLng.lat,
        longitude: latLng.lng,
        attendanceRadius: radius,
      };
      if (!latLng.lat || !latLng.lng) {
        showToast("Select a location on the map", "error");
        setLoading(false);
        return;
      }
      console.log("Submitting event with latLng:", latLng);
      if (editingEventId) {
        await axios.put(
          `http://localhost:5000/api/events/${editingEventId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } },
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
  const [qrToggles, setQrToggles] = useState({});

  return (
    <div className="min-h-screen bg-purple-950 text-white flex flex-col sm:flex-row gap-8 px-6 py-16">
      <div className="w-full max-w-xl border border-blue-400 p-8 rounded-xl flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 border-4 border-blue-400 rounded-md">
            <CalendarPlus className="w-6 h-6" />
          </div>
          <h1 className="font-pixel text-3xl uppercase">
            {editingEventId ? "Edit Event" : "Create Event"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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

          <div className="h-64 w-full border border-blue-400 rounded">
            <MapContainer
              center={latLng.lat ? [latLng.lat, latLng.lng] : [27.7, 85.3]}
              zoom={latLng.lat ? 15 : 12}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationSelector
                latLng={latLng}
                setLatLng={setLatLng}
                radius={radius}
              />
            </MapContainer>
          </div>

          <div className="flex gap-2 mt-2 items-center w-max">
            <label className="text-sm text-white">Radius (m):</label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="p-2 rounded w-24 text-white bg-purple-900 border border-blue-400"
            />
          </div>

          <button
            disabled={loading}
            className="w-full py-3 border border-blue-400 font-pixel uppercase hover:bg-blue-400 hover:text-purple-950 mt-4"
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
              className="w-full py-2 border border-red-400 font-pixel mt-2"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <div className="w-full max-w-xl border border-blue-400 p-6 rounded-xl">
        <h2 className="font-pixel text-2xl mb-4">Current Events</h2>

        {loadingEvents ? (
          <p>Loading...</p>
        ) : events.length === 0 ? (
          <p>No events yet.</p>
        ) : (
          <ul className="space-y-4">
            {events.map((event) => {
              return (
                <li
                  key={event._id}
                  className="p-4 border border-blue-400 bg-purple-900 rounded flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(event)}
                        className="px-3 py-1 border border-blue-400 font-pixel hover:bg-blue-400 hover:text-purple-950"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          setQrToggles((prev) => ({
                            ...prev,
                            [event._id]: !prev[event._id],
                          }))
                        }
                        className="px-3 py-1 border border-blue-400 font-pixel hover:bg-blue-400 hover:text-purple-950"
                      >
                        {qrToggles[event._id] ? "Hide QR" : "Show QR"}
                      </button>
                    </div>
                  </div>
                  {qrToggles[event._id] && event.qrToken && (
                    <QRCodeCanvas
                      value={`${API_BASE}/scan?eventId=${event._id}&token=${event.qrToken}`}
                      size={128}
                      className="mt-2 border border-gray-400 rounded"
                    />
                  )}
                </li>
              );
            })}
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
