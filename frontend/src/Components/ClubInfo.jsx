import { useState } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import Toast from "../Components/Toast";

export default function ClubInfo({ club, onClose }) {
  const [toast, setToast] = useState(null);

  const handleRequestJoin = async () => {
    try {
      const token = getTokenFromCookies();
      if (!token) throw new Error("Not logged in");

      await axios.post(
        `http://localhost:5000/api/clubs/${club._id}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setToast({ message: "Request sent!", type: "success" });
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Failed to send request",
        type: "error",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-purple-950 p-6 rounded-xl w-full max-w-md border border-blue-400 space-y-4">
        <h2 className="font-pixel text-3xl">{club.name}</h2>
        <p className="text-gray-300">
          This club helps you learn and develop your skills. Join us now.
        </p>
        <button
          onClick={handleRequestJoin}
          className="w-full py-2 border border-blue-400 font-pixel hover:bg-blue-400 hover:text-purple-950"
        >
          Request to Join
        </button>
        <button
          onClick={onClose}
          className="w-full py-2 border border-red-400 font-pixel"
        >
          Close
        </button>
      </div>

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
