import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import Discussions from "../Components/Discussions";
import Events from "../Components/Events";
import Polls from "../Components/Polls";
import Documents from "../Components/Documents";

export default function ClubMemberDashboard() {
  const { clubId } = useParams();
  const token = getTokenFromCookies();

  const [clubName, setClubName] = useState("");
  const [activeTab, setActiveTab] = useState("Discussions"); // default tab

  // Fetch club name
  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/clubs/${clubId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
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
    <div className="min-h-screen bg-purple-950 text-white">
      {/* Club Name Bar */}
      <div className="w-full bg-white py-6">
        <h1 className="text-center text-purple-900 font-pixel text-3xl">
          {clubName || "Club"}
        </h1>
      </div>

      {/* Tabs in rounded rectangle */}
      <div className="flex justify-center mt-6">
        <div className="bg-purple-900 rounded-full p-1 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full transition-all duration-300 ${
                activeTab === tab
                  ? "bg-white text-purple-900 font-bold shadow-lg"
                  : "text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Active Tab Content */}
      <div className="mt-8 px-6">{renderActiveTab()}</div>
    </div>
  );
}
