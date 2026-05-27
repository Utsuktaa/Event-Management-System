import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import {
  CalendarPlus,
  Clock,
  MapPin,
  Settings,
  Download,
  Trash2,
  Pencil,
  X,
  AlertCircle,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMapEvents,
} from "react-leaflet";
import { API_BASE } from "../config";
import Toast from "./Toast";

const POLICY_OPTIONS = [
  { value: "OPEN", label: "Open", desc: "Anyone can join instantly" },
  {
    value: "APPROVAL_REQUIRED",
    label: "Approval Required",
    desc: "Members need admin approval",
  },
  { value: "CLOSED", label: "Closed", desc: "No new members accepted" },
];

// Today's date string for min date validation
const todayStr = () => new Date().toISOString().split("T")[0];

function LocationSelector({ latLng, setLatLng, radius }) {
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
        pathOptions={{ color: "#7c3aed", fillOpacity: 0.15 }}
      />
    </>
  ) : null;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 -mt-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />
      {msg}
    </p>
  );
}

function QRBlock({ event }) {
  const canvasRef = useRef(null);
  const qrValue = `${API_BASE}/api/scan?eventId=${event._id}&token=${event.qrToken}`;

  const downloadQR = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `qr-${event.title.replace(/\s+/g, "-")}.png`;
    a.click();
  };

  return (
    <div className="mt-3 flex flex-col items-start gap-2">
      <div ref={canvasRef}>
        <QRCodeCanvas value={qrValue} size={112} className="rounded-lg" />
      </div>
      <button
        onClick={downloadQR}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
      >
        <Download className="w-3 h-3" />
        Download QR
      </button>
    </div>
  );
}

export default function ClubManagement({
  clubId,
  token,
  permissions,
  initialJoinPolicy,
  defaultSection,
  prefillEvent,
}) {
  const can = (p) => permissions.includes(p);

  const [activeSection, setActiveSection] = useState(defaultSection || "events");
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [joinPolicy, setJoinPolicy] = useState(initialJoinPolicy || "APPROVAL_REQUIRED");

  // Keep joinPolicy in sync if parent re-renders with updated prop
  useEffect(() => {
    setJoinPolicy(initialJoinPolicy || "APPROVAL_REQUIRED");
  }, [initialJoinPolicy]);

  // Pre-fill event form when redirected from poll convert-to-event
  useEffect(() => {
    if (prefillEvent) {
      setTitle(prefillEvent.title || "");
      setDescription(prefillEvent.description || "");
      setDate(prefillEvent.date || "");
      setActiveSection("events");
      // Scroll to top so the form is visible
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [prefillEvent]);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [toast, setToast] = useState(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState("club");
  const [imageFile, setImageFile] = useState(null);
  const [latLng, setLatLng] = useState({ lat: null, lng: null });
  const [radius, setRadius] = useState(50);
  const [registrationCap, setCap] = useState("");
  const [editingEventId, setEditingEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [qrToggles, setQrToggles] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null); // eventId to confirm delete

  // Field-level errors
  const [errors, setErrors] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchEvents = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/events/club/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(res.data);
    } catch {
    } finally {
      setLoadingEvents(false);
    }
  }, [clubId, token]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/clubs/${clubId}/requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch {
    } finally {
      setLoadingRequests(false);
    }
  }, [clubId, token]);

  useEffect(() => {
    fetchEvents();
    if (can("approve_join_request")) fetchRequests();
  }, [clubId]);

  // Validate form, return true if valid
  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Event title is required.";
    if (!date) errs.date = "Date is required.";
    else if (date < todayStr()) errs.date = "Date cannot be in the past.";
    if (!location.trim()) errs.location = "Location is required.";
    if (!latLng.lat || !latLng.lng)
      errs.map = "Click on the map to set the event location.";
    if (radius < 10) errs.radius = "Radius must be at least 10 m.";
    if (radius > 5000) errs.radius = "Radius cannot exceed 5000 m.";
    if (
      registrationCap !== "" &&
      (isNaN(parseInt(registrationCap, 10)) ||
        parseInt(registrationCap, 10) < 1)
    ) {
      errs.cap = "Registration cap must be a positive number.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      let imageUrl = "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append(
          "upload_preset",
          import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        );
        const cloudRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          formData,
        );
        imageUrl = cloudRes.data.secure_url;
      }
      const payload = {
        title: title.trim(),
        description: description.trim(),
        date,
        location: location.trim(),
        visibility,
        clubId,
        imageUrl,
        latitude: latLng.lat,
        longitude: latLng.lng,
        attendanceRadius: radius,
        registrationCap:
          registrationCap !== "" ? parseInt(registrationCap, 10) : null,
      };
      if (editingEventId) {
        await axios.put(`${API_BASE}/api/events/${editingEventId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Event updated successfully");
      } else {
        await axios.post(`${API_BASE}/api/events`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        showToast("Event created successfully");
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
    setDescription(event.description || "");
    setDate(event.date.slice(0, 10));
    setLocation(event.location || "");
    setVisibility(event.visibility);
    setLatLng({ lat: event.latitude || null, lng: event.longitude || null });
    setRadius(event.attendanceRadius || 50);
    setCap(event.registrationCap != null ? String(event.registrationCap) : "");
    setImageFile(null);
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setEditingEventId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setLocation("");
    setVisibility("club");
    setImageFile(null);
    setLatLng({ lat: null, lng: null });
    setRadius(50);
    setCap("");
    setErrors({});
  };

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`${API_BASE}/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast("Event deleted");
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
      if (editingEventId === eventId) resetForm();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to delete event",
        "error",
      );
    } finally {
      setDeleteConfirm(null);
    }
  };

  const approveRequest = async (memberId) => {
    try {
      await axios.patch(
        `${API_BASE}/api/clubs/${clubId}/requests/${memberId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("Member approved");
      setRequests((prev) => prev.filter((r) => r._id !== memberId));
    } catch (err) {
      showToast(err.response?.data?.message || "Approval failed", "error");
    }
  };

  const rejectRequest = async (memberId) => {
    try {
      await axios.patch(
        `${API_BASE}/api/clubs/${clubId}/requests/${memberId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      showToast("Request rejected");
      setRequests((prev) => prev.filter((r) => r._id !== memberId));
    } catch (err) {
      showToast(err.response?.data?.message || "Rejection failed", "error");
    }
  };

  const savePolicy = async () => {
    setSavingPolicy(true);
    try {
      await axios.patch(
        `${API_BASE}/api/clubs/${clubId}/policy`,
        { joinPolicy },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      showToast("Join policy updated");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Failed to update policy",
        "error",
      );
    } finally {
      setSavingPolicy(false);
    }
  };

  const sections = [];
  if (can("create_event")) sections.push("events");
  if (can("approve_join_request")) sections.push("requests");
  if (can("manage_members")) sections.push("settings");

  const inputCls =
    "w-full px-4 py-2.5 rounded-xl text-sm placeholder-gray-400 outline-none transition bg-white border border-purple-200 text-blue-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-200";
  const inputErrCls =
    "w-full px-4 py-2.5 rounded-xl text-sm placeholder-gray-400 outline-none transition bg-white border border-red-300 text-blue-900 focus:border-red-400 focus:ring-1 focus:ring-red-100";

  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now);
  const pastEvents = events.filter(
    (e) => new Date(e.date) < now && new Date(e.date) >= cutoff,
  );

  return (
    <div className="max-w-4xl mx-auto mt-4">
      {/* Section tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
              activeSection === s
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white border border-purple-200 text-gray-500 hover:border-purple-400"
            }`}
          >
            {s === "settings" && <Settings className="w-3.5 h-3.5" />}
            {s === "events"
              ? "Events"
              : s === "requests"
                ? "Join Requests"
                : "Settings"}
          </button>
        ))}
      </div>

      {/* ── EVENTS ── */}
      {activeSection === "events" && can("create_event") && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Create / Edit form */}
          <div className="flex-1 rounded-2xl p-6 bg-white border border-purple-100 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100">
                <CalendarPlus className="w-4 h-4 text-purple-600" />
              </div>
              <h2 className="font-semibold text-base text-blue-900">
                {editingEventId ? "Edit Event" : "Create Event"}
              </h2>
              {editingEventId && (
                <button
                  onClick={resetForm}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3"
              noValidate
            >
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setErrors((p) => ({ ...p, title: "" }));
                  }}
                  placeholder="e.g. Annual Tech Fest"
                  className={errors.title ? inputErrCls : inputCls}
                />
                <FieldError msg={errors.title} />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What's this event about?"
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  min={todayStr()}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setErrors((p) => ({ ...p, date: "" }));
                  }}
                  className={errors.date ? inputErrCls : inputCls}
                />
                <FieldError msg={errors.date} />
              </div>

              {/* Location */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    setErrors((p) => ({ ...p, location: "" }));
                  }}
                  placeholder="e.g. Main Hall, Block A"
                  className={errors.location ? inputErrCls : inputCls}
                />
                <FieldError msg={errors.location} />
              </div>

              {/* Visibility */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className={inputCls}
                >
                  <option value="club">Club Only</option>
                  <option value="school">School Wide</option>
                </select>
              </div>

              {/* Image */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Cover Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>

              {/* Map */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Attendance Location <span className="text-red-400">*</span>
                </label>
                <p className="text-xs text-gray-400">
                  Click on the map to set the check-in point.
                </p>
                <div
                  className={`h-52 w-full rounded-xl overflow-hidden border ${errors.map ? "border-red-300" : "border-purple-200"}`}
                >
                  <MapContainer
                    center={
                      latLng.lat ? [latLng.lat, latLng.lng] : [27.7, 85.3]
                    }
                    zoom={latLng.lat ? 15 : 12}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <LocationSelector
                      latLng={latLng}
                      setLatLng={(v) => {
                        setLatLng(v);
                        setErrors((p) => ({ ...p, map: "" }));
                      }}
                      radius={radius}
                    />
                  </MapContainer>
                </div>
                <FieldError msg={errors.map} />
              </div>

              {/* Radius */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Check-in Radius (metres)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={radius}
                    min={10}
                    max={5000}
                    onChange={(e) => {
                      setRadius(Number(e.target.value));
                      setErrors((p) => ({ ...p, radius: "" }));
                    }}
                    className={`px-3 py-2 rounded-xl text-sm w-28 outline-none border ${errors.radius ? "border-red-300" : "border-purple-200"} bg-white text-blue-900`}
                  />
                </div>
                <FieldError msg={errors.radius} />
              </div>

              {/* Registration Cap */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Registration Cap{" "}
                  <span className="text-gray-400 font-normal normal-case">
                    (optional)
                  </span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={registrationCap}
                    min={1}
                    placeholder="Unlimited"
                    onChange={(e) => {
                      setCap(e.target.value);
                      setErrors((p) => ({ ...p, cap: "" }));
                    }}
                    className={`px-3 py-2 rounded-xl text-sm w-28 outline-none border ${errors.cap ? "border-red-300" : "border-purple-200"} bg-white text-blue-900`}
                  />
                </div>
                <FieldError msg={errors.cap} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50 shadow-sm mt-1"
              >
                {loading
                  ? editingEventId
                    ? "Updating…"
                    : "Creating…"
                  : editingEventId
                    ? "Update Event"
                    : "Create Event"}
              </button>

              {editingEventId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full py-2 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

          {/* Event list */}
          <div className="flex-1 rounded-2xl p-6 bg-white border border-purple-100 shadow-sm">
            <h2 className="font-semibold text-base mb-4 text-blue-900">
              Upcoming Events
            </h2>
            {loadingEvents ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : upcomingEvents.length === 0 ? (
              <p className="text-sm text-gray-400">No upcoming events yet.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingEvents.map((event) => (
                  <li
                    key={event._id}
                    className="p-4 rounded-xl bg-purple-50 border border-purple-100"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm text-blue-900 truncate">
                          {event.title}
                        </h3>
                        <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        {can("edit_event") && (
                          <button
                            onClick={() => handleEdit(event)}
                            title="Edit"
                            className="p-1.5 rounded-lg text-purple-600 bg-purple-100 hover:bg-purple-200 transition"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() =>
                            setQrToggles((prev) => ({
                              ...prev,
                              [event._id]: !prev[event._id],
                            }))
                          }
                          title="QR Code"
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
                        >
                          {qrToggles[event._id] ? "Hide QR" : "QR"}
                        </button>
                        {can("edit_event") && (
                          <button
                            onClick={() => setDeleteConfirm(event._id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    {qrToggles[event._id] && event.qrToken && (
                      <QRBlock event={event} />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {pastEvents.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-sm mb-3 text-gray-400">
                  Recent Past Events
                </h3>
                <ul className="space-y-3">
                  {pastEvents.map((event) => (
                    <li
                      key={event._id}
                      className="p-4 rounded-xl bg-gray-50 border border-gray-200"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h3 className="font-medium text-sm text-gray-500">
                            {event.title}
                          </h3>
                          <div className="flex gap-3 mt-1 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </span>
                            )}
                          </div>
                        </div>
                        {can("edit_event") && (
                          <button
                            onClick={() => setDeleteConfirm(event._id)}
                            title="Delete"
                            className="p-1.5 rounded-lg text-red-400 bg-red-50 hover:bg-red-100 transition shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── JOIN REQUESTS ── */}
      {activeSection === "requests" && can("approve_join_request") && (
        <div className="max-w-xl">
          <h2 className="font-semibold text-base mb-4 text-blue-900">
            Pending Join Requests
          </h2>
          {loadingRequests ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : requests.length === 0 ? (
            <p className="text-sm text-gray-400">No pending requests.</p>
          ) : (
            <ul className="space-y-3">
              {requests.map((req) => (
                <li
                  key={req._id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-purple-100 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-purple-500 to-indigo-500 flex-shrink-0">
                      {req.userId?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {req.userId?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {req.userId?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approveRequest(req._id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 transition"
                    >
                      Approve
                    </button>
                    {can("reject_join_request") && (
                      <button
                        onClick={() => rejectRequest(req._id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 border border-red-200 hover:bg-red-50 transition"
                      >
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

      {/* ── SETTINGS ── */}
      {activeSection === "settings" && can("manage_members") && (
        <div className="max-w-lg rounded-2xl p-6 bg-white border border-purple-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-purple-100">
              <Settings className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="font-semibold text-base text-blue-900">
              Club Settings
            </h2>
          </div>
          <p className="text-sm font-medium mb-3 text-gray-700">Join Policy</p>
          <div className="flex flex-col gap-2 mb-6">
            {POLICY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition border ${
                  joinPolicy === opt.value
                    ? "bg-purple-50 border-purple-300"
                    : "bg-white border-purple-100"
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
                  <p className="text-sm font-medium text-blue-900">
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={savePolicy}
            disabled={savingPolicy}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50 shadow-sm"
          >
            {savingPolicy ? "Saving…" : "Save Settings"}
          </button>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-red-100"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-gray-900 mb-2">
              Delete Event?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete the event, all registrations, and
              attendance records. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
