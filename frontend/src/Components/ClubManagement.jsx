import { useState, useEffect } from "react";
import axios from "axios";
import { CalendarPlus, Clock, MapPin, Settings } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import { API_BASE } from "../config";
import Toast from "./Toast";

const POLICY_OPTIONS = [
  { value: "OPEN", label: "Open"},
  { value: "APPROVAL_REQUIRED", label: "Approval Required" },
  { value: "CLOSED", label: "Closed" },
];

function LocationSelector({ latLng, setLatLng, radius }) {
  useMapEvents({ click(e) { setLatLng({ lat: e.latlng.lat, lng: e.latlng.lng }); } });
  return latLng.lat && latLng.lng ? (
    <>
      <Marker position={[latLng.lat, latLng.lng]} />
      <Circle center={[latLng.lat, latLng.lng]} radius={radius} pathOptions={{ color: "blue", fillOpacity: 0.2 }} />
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
      const res = await axios.get(`http://localhost:5000/api/events/club/${clubId}`);
      setEvents(res.data);
    } catch { } finally { setLoadingEvents(false); }
  };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/clubs/${clubId}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch { } finally { setLoadingRequests(false); }
  };

  useEffect(() => {
    fetchEvents();
    if (can("approve_join_request")) fetchRequests();
  }, [clubId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!latLng.lat || !latLng.lng) { showToast("Select a location on the map", "error"); return; }
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
        await axios.put(`http://localhost:5000/api/events/${editingEventId}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        showToast("Event updated");
      } else {
        await axios.post("http://localhost:5000/api/events", payload, { headers: { Authorization: `Bearer ${token}` } });
        showToast("Event created");
      }
      resetForm();
      fetchEvents();
    } catch (err) {
      showToast(err.response?.data?.message || "Event action failed", "error");
    } finally { setLoading(false); }
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
    setTitle(""); setDescription(""); setDate(""); setLocation("");
    setVisibility("club"); setImageFile(null);
  };

  const approveRequest = async (memberId) => {
    try {
      await axios.patch(`http://localhost:5000/api/clubs/${clubId}/requests/${memberId}/approve`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Member approved");
      setRequests((prev) => prev.filter((r) => r._id !== memberId));
    } catch { showToast("Approval failed", "error"); }
  };

  const rejectRequest = async (memberId) => {
    try {
      await axios.patch(`http://localhost:5000/api/clubs/${clubId}/requests/${memberId}/reject`, {}, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Request rejected");
      setRequests((prev) => prev.filter((r) => r._id !== memberId));
    } catch { showToast("Rejection failed", "error"); }
  };

  const savePolicy = async () => {
    setSavingPolicy(true);
    try {
      await axios.patch(`http://localhost:5000/api/clubs/${clubId}/policy`, { joinPolicy }, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Join policy updated");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to update policy", "error");
    } finally { setSavingPolicy(false); }
  };

  const sections = [];
  if (can("create_event")) sections.push("events");
  if (can("approve_join_request")) sections.push("requests");
  if (can("manage_members")) sections.push("settings");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-3 mb-6 flex-wrap">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`flex items-center gap-2 px-4 py-2 font-pixel text-sm uppercase border rounded transition ${
              activeSection === s ? "bg-blue-400 text-purple-950 border-blue-400" : "border-blue-400 text-white hover:bg-blue-400/10"
            }`}
          >
            {s === "settings" && <Settings className="w-3.5 h-3.5" />}
            {s === "events" ? "Events" : s === "requests" ? "Join Requests" : "Settings"}
          </button>
        ))}
      </div>

      {activeSection === "events" && can("create_event") && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 border border-blue-400 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-5">
              <CalendarPlus className="w-5 h-5" />
              <h2 className="font-pixel text-xl uppercase">{editingEventId ? "Edit Event" : "Create Event"}</h2>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event Title" required className="w-full p-3 bg-purple-900 border border-blue-400 rounded text-white placeholder-gray-400" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Description" className="w-full p-3 bg-purple-900 border border-blue-400 rounded text-white placeholder-gray-400" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full p-3 bg-purple-900 border border-blue-400 rounded text-white" />
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location" className="w-full p-3 bg-purple-900 border border-blue-400 rounded text-white placeholder-gray-400" />
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full p-3 bg-purple-900 border border-blue-400 rounded text-white">
                <option value="club">Club Only</option>
                <option value="school">School Wide</option>
              </select>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-white" />
              <div className="h-56 w-full border border-blue-400 rounded">
                <MapContainer center={latLng.lat ? [latLng.lat, latLng.lng] : [27.7, 85.3]} zoom={latLng.lat ? 15 : 12} style={{ height: "100%", width: "100%" }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationSelector latLng={latLng} setLatLng={setLatLng} radius={radius} />
                </MapContainer>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-white">Radius (m):</label>
                <input type="number" value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="p-2 rounded w-24 text-white bg-purple-900 border border-blue-400" />
              </div>
              <button disabled={loading} className="w-full py-3 border border-blue-400 font-pixel uppercase hover:bg-blue-400 hover:text-purple-950 disabled:opacity-50">
                {loading ? (editingEventId ? "Updating..." : "Creating...") : editingEventId ? "Update Event" : "Create Event"}
              </button>
              {editingEventId && (
                <button type="button" onClick={resetForm} className="w-full py-2 border border-red-400 font-pixel">Cancel Edit</button>
              )}
            </form>
          </div>

          <div className="flex-1 border border-blue-400 p-6 rounded-xl">
            <h2 className="font-pixel text-xl mb-4">Current Events</h2>
            {loadingEvents ? <p>Loading...</p> : events.length === 0 ? <p className="text-gray-400">No events yet.</p> : (
              <ul className="space-y-4">
                {events.map((event) => (
                  <li key={event._id} className="p-4 border border-blue-400 bg-purple-900 rounded flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-pixel text-lg">{event.title}</h3>
                        <div className="text-sm text-gray-300 flex gap-3 mt-1">
                          <span className="flex gap-1 items-center"><Clock className="w-3 h-3" />{new Date(event.date).toLocaleDateString()}</span>
                          <span className="flex gap-1 items-center"><MapPin className="w-3 h-3" />{event.location}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {can("edit_event") && (
                          <button onClick={() => handleEdit(event)} className="px-3 py-1 border border-blue-400 font-pixel text-xs hover:bg-blue-400 hover:text-purple-950">Edit</button>
                        )}
                        <button onClick={() => setQrToggles((prev) => ({ ...prev, [event._id]: !prev[event._id] }))} className="px-3 py-1 border border-blue-400 font-pixel text-xs hover:bg-blue-400 hover:text-purple-950">
                          {qrToggles[event._id] ? "Hide QR" : "QR"}
                        </button>
                      </div>
                    </div>
                    {qrToggles[event._id] && event.qrToken && (
                      <QRCodeCanvas value={`${API_BASE}/scan?eventId=${event._id}&token=${event.qrToken}`} size={112} className="mt-1 border border-gray-400 rounded" />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {activeSection === "requests" && can("approve_join_request") && (
        <div className="max-w-xl">
          <h2 className="font-pixel text-xl mb-4">Pending Join Requests</h2>
          {loadingRequests ? <p>Loading...</p> : requests.length === 0 ? <p className="text-gray-400">No pending requests.</p> : (
            <ul className="space-y-3">
              {requests.map((req) => (
                <li key={req._id} className="p-4 border border-blue-400 bg-purple-900 rounded flex justify-between items-center">
                  <div>
                    <p className="font-pixel">{req.userId?.name}</p>
                    <p className="text-xs text-gray-400">{req.userId?.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => approveRequest(req._id)} className="px-3 py-1 border border-blue-400 font-pixel text-xs hover:bg-blue-400 hover:text-purple-950">Approve</button>
                    {can("reject_join_request") && (
                      <button onClick={() => rejectRequest(req._id)} className="px-3 py-1 border border-red-400 font-pixel text-xs hover:bg-red-400 hover:text-white">Reject</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeSection === "settings" && can("manage_members") && (
        <div className="max-w-lg border border-blue-400 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="font-pixel text-xl uppercase">Club Settings</h2>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-300 mb-4">Join Policy</p>
            <div className="flex flex-col gap-3">
              {POLICY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition ${
                    joinPolicy === opt.value
                      ? "border-blue-400 bg-blue-400/10"
                      : "border-blue-400/30 hover:border-blue-400/60"
                  }`}
                >
                  <input
                    type="radio"
                    name="joinPolicy"
                    value={opt.value}
                    checked={joinPolicy === opt.value}
                    onChange={() => setJoinPolicy(opt.value)}
                    className="mt-0.5 accent-blue-400"
                  />
                  <div>
                    <p className="font-pixel text-sm text-white">{opt.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={savePolicy}
            disabled={savingPolicy}
            className="w-full py-3 border border-blue-400 font-pixel uppercase hover:bg-blue-400 hover:text-purple-950 transition disabled:opacity-50"
          >
            {savingPolicy ? "Saving..." : "Save Settings"}
          </button>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
