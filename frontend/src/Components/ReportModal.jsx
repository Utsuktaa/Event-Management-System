import { useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { API_BASE } from "../config";

const REASONS = ["spam", "harassment", "scam", "other"];

export default function ReportModal({ targetId, targetType, token, onClose }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await axios.post(
        `${API_BASE}/api/reports`,
        { targetId, targetType, reason, details },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {done ? (
          <div className="text-center py-8">
            <p className="text-green-600 font-semibold text-lg">
              Report submitted.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Report Content
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Why are you reporting this post?
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`py-2 px-3 rounded-lg border text-sm capitalize transition ${
                    reason === r
                      ? "border-purple-600 bg-purple-50 text-purple-700 font-medium"
                      : "border-gray-200 text-gray-600 hover:border-purple-300"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Optional info"
              rows={3}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-800 bg-white placeholder-gray-400 resize-none focus:outline-none focus:border-purple-400"
            />

            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

            <div className="flex gap-3 mt-4">
              <button
                onClick={onClose}
                className="flex-1 py-2 border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2 bg-purple-600 text-white rounded-full text-sm hover:bg-purple-700 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
