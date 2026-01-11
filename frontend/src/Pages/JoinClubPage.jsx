import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function JoinClubPage() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setLoading(true);
    setError("");

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const res = await fetch(`http://localhost:5000/api/clubs/${clubId}/join`, {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send join request");
        setLoading(false);
        return;
      }

      alert("Join request sent! Waiting for admin approval.");
      navigate("/clubs"); 
    } catch (err) {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white">
      <h2 className="text-3xl mb-4">Join this Club</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={loading}
        className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600"
      >
        {loading ? "Sending..." : "Request to Join"}
      </button>
    </div>
  );
}
