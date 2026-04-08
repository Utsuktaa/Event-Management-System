import { useState, useEffect } from "react";
import axios from "axios";
import { CalendarPlus, Clock, MapPin, Settings } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import { API_BASE } from "../config";
import Toast from "./Toast";

const POLICY_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "APPROVAL_REQUIRED", label: "Approval Required" },
  { value: "CLOSED", label: "Closed" },
];

function LocationSelector({ latLng, setLatLng, radius }) {
  useMapEvents({
    click(e) {
      setLatLng({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return latLng.lat && latLng.lng ? (
    <>
      <Marker position={[latLng.lat, latLng.lng]} />
      <Circle center={[latLng.lat, latLng.lng]} radius={radius} pathOptions={{ color: "#7c3aed", fillOpacity: 0.15 }} />
    </>
  ) : null;
}

export default function ClubManagement({ clubId, token, permissions, initialJoinPolicy }) {
  const can = (p) => permissions.includes(p);

  const [activeSection, setActiveSection] = useState("events");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [joinPolicy, setJoinPolicy] = useState(initialJoinPolicy || "APPROVAL_REQUIRED");
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [toast, setToast] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState("club");
  const [imageFile, setImageFile] = useState(null);
  const [latLng, setLatLng] = useState({ lat: null, lng: null });
  const [radius, setRadius] = useState(50);
  const [editingEventId, setEditingEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrToggles, setQrToggles] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/events/club/${clubId}`);
      setEvents(res.data);
    } catch {
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/clubs/${clubId}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch {
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    if (can("approve_join_request")) fetchRequests();
  }, [clubId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!latLng.lat || !latLng.lng) {
      showToast("Select a location on the map", "error");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
        const cloudRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData
        );
        imageUrl = cloudRes.data.secure_url;
      }
      const payload = { title, description, date, location, visibility, clubId, imageUrl, latitude: latLng.lat, longitude: latLng.lng, attendanceRadius: radius };
      if (editingEventId) {
        await axios.put(`${API_BASE}/api/events/${editingEventId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Event updated");
      } else {
        await axios.post(`${API_BASE}/api/events`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Event created");
      }
      resetForm();
      fetchEvents();
    } catch (err) {
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

  const approveRequest = async (memberId) => {
    try {
      await axios.patch(`${API_BASE}/api/clubs/${clubId}/requests/${memberId}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Member approved");
      setRequests((prev) => prev.filter((r) => r._id !== memberId));
    } catch {
      showToast("Approval failed", "error");
    }
  };

  const rejectRequest = async (memberId) => {
    try {
      await axios.patch(`${API_BASE}/api/clubs/${clubId}/requests/${memberId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Request rejected");
      setRequests((prev) => prev.filter((r) => r._id !== memberId));
    } catch {
      showToast("Rejection failed", "error");
    }
  };

  const savePolicy = async () => {
    setSavingPolicy(true);
    try {
      await axios.patch(`${API_BASE}/api/clubs/${clubId}/policy`, { joinPolicy }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Join policy updated");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update policy", "error");
    } finally {
      setSavingPolicy(false);
    }
  };

  const sections = [];
  if (can("create_event")) sections.push("events");
  if (can("approve_join_request")) sections.push("requests");
  if (can("manage_members")) sections.push("settings");

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm placeholder-gray-400 outline-none transition bg-white/80 border border-purple-200 text-blue-900 focus:border-purple-500";

  return (
    <div className="max-w-4xl mx-auto mt-4">
      <div className="flex gap-2 mb-6 flex-wrap">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeSection === s
                ? "bg-purple-700 text-white shadow-md"
                : "bg-white/75 border border-purple-200 text-gray-500 hover:border-purple-400"
            }`}
          >
            {s === "settings" && <Settings className="w-3.5 h-3.5" />}
            {s === "events" ? "Events" : s === "requests" ? "Join Requests" : "Settings"}
          </button>
        ))}
      </div>

      {activeSection === "events" && can("create_event") && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 rounded-2xl p-6 bg-white/75 border border-purple-200/50 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-500 shadow-md">
                <CalendarPlus className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-semibold text-base text-blue-900">
                {editingEventId ? "Edit Event" : "Create Event"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" required className={inputCls} />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Description" className={`${inputCls} resize-none`} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={inputCls} />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className={inputCls} />
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className={inputCls}>
                <option value="club">Club Only</option>
                <option value="school">School Wide</option>
              </select>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm text-gray-500" />
              <div className="h-52 w-full rounded-xl overflow-hidden border border-purple-200">
                <MapContainer
                  center={latLng.lat ? [latLng.lat, latLng.lng] : [27.7, 85.3]}
                  zoom={latLng.lat ? 15 : 12}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationSelector latLng={latLng} setLatLng={setLatLng} radius={radius} />
                </MapContainer>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Radius (m):</label>
                <input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="px-3 py-1.5 rounded-lg text-sm w-24 outline-none bg-white/80 border border-purple-200 text-blue-900" />
              </div>
              <button
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 transition disabled:opacity-50 shadow-md"
              >
                {loading ? (editingEventId ? "Updating..." : "Creating...") : (editingEventId ? "Update Event" : "Create Event")}
              </button>
              {editingEventId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full py-2 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>

          <div className="flex-1 rounded-2xl p-6 bg-white/75 border border-purple-200/50 shadow-sm">
            <h2 className="font-semibold text-base mb-4 text-blue-900">Current Events</h2>
            {loadingEvents ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : events.filter((e) => new Date(e.date) >= new Date()).length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming events.</p>
            ) : (
              <ul className="space-y-3">
                {events.filter((e) => new Date(e.date) >= new Date()).map((event) => (
                  <li key={event._id} className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-medium text-sm text-blue-900">{event.title}</h3>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {can("edit_event") && (
                          <button onClick={() => handleEdit(event)} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700 hover:opacity-80 transition">
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => setQrToggles((prev) => ({ ...prev, [event._id]: !prev[event._id] }))}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-600 hover:opacity-80 transition"
                        >
                          {qrToggles[event._id] ? "Hide QR" : "QR"}
                        </button>
                      </div>
                    </div>
                    {qrToggles[event._id] && event.qrToken && (
                      <QRCodeCanvas value={`${API_BASE}/scan?eventId=${event._id}&token=${event.qrToken}`} size={112} className="mt-3 rounded-lg" />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {(() => {
              const now = new Date();
              const cutoff = new Date();
              cutoff.setDate(cutoff.getDate() - 30);
              const past = events.filter((e) => new Date(e.date) < now && new Date(e.date) >= cutoff);
              if (past.length === 0) return null;
              return (
                <div className="mt-6">
                  <h3 className="font-semibold text-sm mb-3 text-gray-500">Recent Past Events</h3>
                  <ul className="space-y-3">
                    {past.map((event) => (
                      <li key={event._id} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <h3 className="font-medium text-sm text-gray-500">{event.title}</h3>
                        <div className="flex gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(event.date).toLocaleDateString()}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {activeSection === "requests" && can("approve_join_request") && (
        <div className="max-w-xl">
          <h2 className="font-semibold text-base mb-4 text-blue-900">Pending Join Requests</h2>
          {loadingRequests ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-400">No pending requests.</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((req) => (
                <li key={req._id} className="flex items-center justify-between p-4 rounded-2xl bg-white/75 border border-purple-200/50 shadow-sm">
                  <div>
                    <p className="text-sm font-medium text-blue-900">{req.userId?.name}</p>
                    <p className="text-xs text-gray-400">{req.userId?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveRequest(req._id)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 transition">
                      Approve
                    </button>
                    {can("reject_join_request") && (
                      <button onClick={() => rejectRequest(req._id)} className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition">
                        Reject
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeSection === "settings" && can("manage_members") && (
        <div className="max-w-lg rounded-2xl p-6 bg-white/75 border border-purple-200/50 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-500 shadow-md">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-semibold text-base text-blue-900">Club Settings</h2>
          </div>

          <p className="text-sm font-medium mb-3 text-gray-700">Join Policy</p>
          <div className="flex flex-col gap-2 mb-6">
            {POLICY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition border ${
                  joinPolicy === opt.value
                    ? "bg-purple-50 border-purple-300"
                    : "bg-white/60 border-purple-100"
                }`}
              >
                <input
                  type="radio"
                  name="joinPolicy"
                  value={opt.value}
                  checked={joinPolicy === opt.value}
                  onChange={() => setJoinPolicy(opt.value)}
                  className="mt-0.5 accent-purple-600"
                />
                <div>
                  <p className="text-sm font-medium text-blue-900">{opt.label}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={savePolicy}
            disabled={savingPolicy}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-700 hover:bg-purple-800 transition disabled:opacity-50 shadow-md"
          >
            {savingPolicy ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
