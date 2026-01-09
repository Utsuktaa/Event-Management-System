import React, { useState } from "react";
import { getTokenFromCookies } from "../Utils/auth";

const API_URL = "http://localhost:5000/api/admin";

export default function SuperAdminDashboard() {
  const [clubName, setClubName] = useState("");
  const [clubId, setClubId] = useState("");
  const [userId, setUserId] = useState("");

  const createClub = async (e) => {
    e.preventDefault();
    const token = getTokenFromCookies();
    if (!token) return;

    if (!clubName.trim()) return;

    try {
      const res = await fetch(`${API_URL}/clubs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: clubName }),
      });

      const data = await res.json();

      if (res.ok) {
        setClubId(data._id);
        setClubName("");
        alert(`Created club: ${data.name} (ID: ${data._id})`);
      } else {
        alert(`Error: ${data.message || "Failed to create club"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error or backend not running.");
    }
  };

  const assignAdmin = async (e) => {
    e.preventDefault();
    const token = getTokenFromCookies();
    if (!token) return;

    if (!clubId.trim() || !userId.trim()) return;

    try {
      const res = await fetch(`${API_URL}/clubs/${clubId}/admins`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (res.ok) {
        setUserId("");
        alert(`Assigned user ${userId} as admin to club ${clubId}`);
      } else {
        alert(`Error: ${data.message || "Failed to assign admin"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error or backend not running.");
    }
  };

  return (
    <div className="p-8 bg-purple-950 text-white rounded-xl border border-blue-400 shadow-lg flex flex-col gap-8">
      <form onSubmit={createClub} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Club Name"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
          className="flex-1 p-3 bg-purple-900 border border-blue-400 rounded-md outline-none focus:border-blue-300 transition"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-blue-400 text-purple-950 font-pixel uppercase rounded-md hover:bg-blue-300 transition"
        >
          Create Club
        </button>
      </form>

      <form onSubmit={assignAdmin} className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          placeholder="Club ID"
          value={clubId}
          onChange={(e) => setClubId(e.target.value)}
          className="flex-1 p-3 bg-purple-900 border border-blue-400 rounded-md outline-none focus:border-blue-300 transition"
        />
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="flex-1 p-3 bg-purple-900 border border-blue-400 rounded-md outline-none focus:border-blue-300 transition"
        />
        <button
          type="submit"
          className="px-6 py-3 border border-blue-400 text-white font-pixel uppercase rounded-md hover:bg-blue-400 hover:text-purple-950 transition"
        >
          Assign Admin
        </button>
      </form>
    </div>
  );
}
