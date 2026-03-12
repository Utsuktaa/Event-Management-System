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
