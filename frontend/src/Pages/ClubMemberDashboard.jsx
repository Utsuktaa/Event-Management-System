import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import Discussions from "../Components/Discussions";
import Events from "../Components/Events";
import Polls from "../Components/Polls";
import Documents from "../Components/Documents";
const API = import.meta.env.VITE_API_URL;

export default function ClubMemberDashboard() {
  const { clubId } = useParams();
  const token = getTokenFromCookies();

  const [clubName, setClubName] = useState("");
  const [activeTab, setActiveTab] = useState("Discussions");

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await axios.get(`${API}/api/clubs/${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClubName(res.data.name);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClub();
  }, [clubId, token]);

  const tabs = ["Discussions", "Events", "Polls", "Documents"];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "Discussions":
        return <Discussions clubId={clubId} token={token} />;
      case "Events":
        return <Events clubId={clubId} token={token} />;
      case "Polls":
        return <Polls clubId={clubId} token={token} />;
      case "Documents":
        return <Documents clubId={clubId} token={token} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen font-sans"
      style={{
        background:
          "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0f9ff 100%)",
      }}
    >
      <div
        className="px-6 py-4 border-b"
        style={{
          background: "rgba(255,255,255,0.95)",
          borderColor: "rgba(124,58,237,0.10)",
        }}
      >
        <h1 className="text-xl font-bold" style={{ color: "#1E3A8A" }}>
          {clubName || "Club"}
        </h1>
      </div>

      <div
        className="sticky top-0 z-30 px-6 border-b"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(124,58,237,0.10)",
        }}
      >
        <div className="flex gap-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2"
              style={
                activeTab === tab
                  ? { color: "#7C3AED", borderColor: "#7C3AED" }
                  : { color: "#6B7280", borderColor: "transparent" }
              }
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-8">{renderActiveTab()}</div>
    </div>
  );
}
