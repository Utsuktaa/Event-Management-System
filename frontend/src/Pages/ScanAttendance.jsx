import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";

export default function ScanAttendance() {
  const [searchParams] = useSearchParams();

  const eventId = searchParams.get("eventId");
  const token = searchParams.get("token");

  useEffect(() => {
    const markAttendance = () => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const jwt = getTokenFromCookies();

        try {
          const res = await axios.post(
            "http://localhost:5000/api/events/attendance",
            {
              eventId,
              token,
              lat,
              lng,
            },
            {
              headers: { Authorization: `Bearer ${jwt}` },
            },
          );

          alert(res.data.message);
        } catch (err) {
          alert(err.response?.data?.message || "Attendance failed");
        }
      });
    };

    markAttendance();
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Processing attendance</h1>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import { X } from "lucide-react";

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
  const eventId = searchParams.get("eventId");
  const qrToken = searchParams.get("token");

  const showToast = (message, type = "success", duration = 4000) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  };

  useEffect(() => {
    const markAttendance = async () => {
      try {
        const token = getTokenFromCookies();
        if (!token) throw new Error("Not logged in");

        if (!eventId || !qrToken) throw new Error("Invalid QR link");

        const res = await axios.post(
          `hhttps://d6ca-2400-1a00-3b2e-54fc-9c00-9c90-e3d6-c230.ngrok-free.app/api/attendance/mark`,
          { eventId, token: qrToken },
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

    markAttendance();
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
