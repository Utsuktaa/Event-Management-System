import { useState } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import { X, Users, CheckCircle2, AlertCircle } from "lucide-react";

const POLICY_DESC = {
  OPEN: "Can join anytime",
  APPROVAL_REQUIRED: "Your request will be reviewed.",
  CLOSED: "Requests are closed for now.",
};

export default function ClubInfo({ club, onClose }) {
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [message, setMessage] = useState("");

  const handleRequestJoin = async () => {
    const token = getTokenFromCookies();
    if (!token) {
      setStatus("error");
      setMessage("You must be logged in.");
      return;
    }
    setStatus("loading");
    try {
      await axios.post(
        `http://localhost:5000/api/clubs/${club._id}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setStatus("success");
      setMessage(
        club.joinPolicy === "OPEN"
          ? "You've joined the club!"
          : "Request sent! Waiting for admin approval.",
      );
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to send request.");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 relative"
        style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(124,58,237,0.15)",
          boxShadow: "0 20px 60px rgba(124,58,237,0.18)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full transition hover:bg-purple-50"
          style={{ color: "#9CA3AF" }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
            }}
          >
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg" style={{ color: "#1E3A8A" }}>
              {club.name}
            </h2>
            {club.joinPolicy && (
              <span
                className="text-xs font-medium capitalize"
                style={{ color: "#7C3AED" }}
              >
                {club.joinPolicy.replace("_", " ").toLowerCase()}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
          {POLICY_DESC[club.joinPolicy] ||
            "Join this club to access events and discussions."}
        </p>

        {status === "success" ? (
          <div
            className="flex items-center gap-2 p-3 rounded-xl mb-4"
            style={{
              background: "rgba(22,163,74,0.08)",
              border: "1px solid rgba(22,163,74,0.2)",
            }}
          >
            <CheckCircle2
              className="w-4 h-4 shrink-0"
              style={{ color: "#16a34a" }}
            />
            <p className="text-sm font-medium" style={{ color: "#15803d" }}>
              {message}
            </p>
          </div>
        ) : status === "error" ? (
          <div
            className="flex items-center gap-2 p-3 rounded-xl mb-4"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            <AlertCircle
              className="w-4 h-4 shrink-0"
              style={{ color: "#dc2626" }}
            />
            <p className="text-sm font-medium" style={{ color: "#991b1b" }}>
              {message}
            </p>
          </div>
        ) : null}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition hover:bg-gray-50"
            style={{
              border: "1px solid rgba(124,58,237,0.15)",
              color: "#6B7280",
            }}
          >
            {status === "success" ? "Done" : "Cancel"}
          </button>

          {status !== "success" && (
            <button
              onClick={handleRequestJoin}
              disabled={status === "loading"}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg,#1E3A8A,#7C3AED)",
                boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
              }}
            >
              {status === "loading"
                ? "Sending..."
                : club.joinPolicy === "OPEN"
                  ? "Join Now"
                  : "Request to Join"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
