import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle, XCircle, MapPin, Loader2, Calendar } from "lucide-react";
import { getTokenFromCookies } from "../Utils/auth";
import { API_BASE } from "../config";

// Status states: "loading" | "success" | "error"
export default function ScanAttendance() {
  const [status, setStatus]   = useState("loading");
  const [message, setMessage] = useState("");

  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const eventId        = searchParams.get("eventId");
  const qrToken        = searchParams.get("token");

  useEffect(() => {
    const markAttendance = async (lat, lng) => {
      try {
        const token = getTokenFromCookies();

        if (!token) {
          const redirectUrl = encodeURIComponent(`/scan?eventId=${eventId}&token=${qrToken}`);
          navigate(`/login?redirect=${redirectUrl}`);
          return;
        }

        if (!eventId || !qrToken) {
          setMessage("Invalid QR code. Please scan again.");
          setStatus("error");
          return;
        }

        const res = await axios.post(
          `${API_BASE}/api/attendance/mark`,
          { eventId, token: qrToken, lat, lng },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        setMessage(res.data.message || "Attendance marked successfully!");
        setStatus("success");
      } catch (err) {
        setMessage(err.response?.data?.message || "Something went wrong. Please try again.");
        setStatus("error");
      }
    };

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      setStatus("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => markAttendance(pos.coords.latitude, pos.coords.longitude),
      (err) => {
        setMessage("Location access denied. Please allow location to mark attendance.");
        setStatus("error");
      },
      { timeout: 10000 }
    );
  }, [eventId, qrToken]);

  return (
    <div
      className="min-h-screen font-sans flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0f9ff 100%)" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo / brand mark */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-purple-600 shadow-lg shadow-purple-200">
            <Calendar className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-purple-100 shadow-sm p-8 flex flex-col items-center gap-5 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-purple-50 border-2 border-purple-200">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" strokeWidth={2} />
              </div>
              <div>
                <p className="text-base font-bold text-blue-900">Marking your attendance…</p>
                <p className="text-sm text-gray-400 mt-1">Please keep patience, this may take a moment.</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-purple-50 px-3 py-2 rounded-xl border border-purple-100">
                <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                Verifying your location…
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-green-50 border-2 border-green-200">
                <CheckCircle className="w-8 h-8 text-green-500" strokeWidth={2} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">You're all set!</p>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
              </div>
              <button
                onClick={() => navigate("/user-dashboard")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-red-50 border-2 border-red-200">
                <XCircle className="w-8 h-8 text-red-400" strokeWidth={2} />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">Couldn't mark attendance</p>
                <p className="text-sm text-gray-500 mt-1">{message}</p>
              </div>
              <button
                onClick={() => navigate("/user-dashboard")}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Back to Dashboard
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">© 2025 EventSync</p>
      </div>
    </div>
  );
}
