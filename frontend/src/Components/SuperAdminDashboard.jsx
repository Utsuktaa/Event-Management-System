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
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    if (!clubName.trim()) {
      alert("Club name cannot be empty.");
      return;
    }

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
        alert(`Created club: ${data.name} (ID: ${data._id})`);
        setClubId(data._id);
        setClubName(""); // clear input
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
    if (!token) {
      alert("No token found. Please log in again.");
      return;
    }

    if (!clubId.trim() || !userId.trim()) {
      alert("Club ID and User ID cannot be empty.");
      return;
    }

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
        alert(`Assigned user ${userId} as admin to club ${clubId}`);
        setUserId(""); // clear input
      } else {
        alert(`Error: ${data.message || "Failed to assign admin"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Network error or backend not running.");
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={createClub} className="mb-4">
        <input
          type="text"
          placeholder="Club Name"
          value={clubName}
          onChange={(e) => setClubName(e.target.value)}
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Create Club
        </button>
      </form>

      <form onSubmit={assignAdmin}>
        <input
          type="text"
          placeholder="Club ID"
          value={clubId}
          onChange={(e) => setClubId(e.target.value)}
          className="border p-2 mr-2"
        />
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 mr-2"
        />
        <button type="submit">Assign Admin</button>
      </form>
    </div>
  );
}
