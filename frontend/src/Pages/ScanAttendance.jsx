import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import { X } from "lucide-react";
import { API_BASE } from "../config";

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

export default function ScanAttendance() {
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get("eventId");
  const qrToken = searchParams.get("token");

  const showToast = (message, type = "success", duration = 4000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  useEffect(() => {
    const markAttendance = async (lat, lng) => {
      try {
        const token = getTokenFromCookies();

        if (!token) {
          // User not logged in, redirect to signup
          const redirectUrl = encodeURIComponent(
            `/scan?eventId=${eventId}&token=${qrToken}`,
          );
          window.location.href = `${FRONTEND_BASE_URL}/signup?redirect=${redirectUrl}`;
          return;
        }

        if (!eventId || !qrToken) throw new Error("Invalid QR link");

        // Send attendance with coordinates
        const res = await axios.post(
          `${API_BASE}/api/attendance/mark`,
          { eventId, token: qrToken, lat, lng },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        showToast(res.data.message || "Attendance marked", "success");
        setSuccess(true);
      } catch (err) {
        console.error(err);
        showToast(err.response?.data?.message || err.message, "error");
      } finally {
        setLoading(false);
      }
    };

    // Request geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          markAttendance(latitude, longitude);
        },
        (err) => {
          showToast("Unable to get location: " + err.message, "error");
          setLoading(false);
        },
      );
    } else {
      showToast("Geolocation not supported by your browser", "error");
      setLoading(false);
    }
  }, [eventId, qrToken]);

  return (
    <div className="min-h-screen bg-purple-950 flex flex-col items-center justify-center px-4 py-8 text-white">
      {loading ? (
        <p className="text-xl font-pixel">Marking your attendance...</p>
      ) : success ? (
        <p className="text-xl font-pixel text-green-400">
          Attendance marked successfully!
        </p>
      ) : (
        <p className="text-xl font-pixel text-red-400">
          Failed to mark attendance.
        </p>
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
