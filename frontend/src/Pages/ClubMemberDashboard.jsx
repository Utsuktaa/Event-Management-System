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

  useEffect(() => {
    // fetch club name
    const fetchClub = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/clubs/${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClubName(res.data.name);
      } catch (err) {
        console.error(err);
      }
    };
    fetchClub();
  }, [clubId]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "Discussions":
        return <Discussions clubId={clubId} />;
      case "Events":
        return <Events clubId={clubId} />;
      case "Polls":
        return <Polls clubId={clubId} />;
      case "Documents":
        return <Documents clubId={clubId} />;
      default:
        return null;
    }
  };

  const tabs = ["Discussions", "Events", "Polls", "Documents"];

  return (
    <div className="min-h-screen bg-purple-950 text-white p-8">
      {/* Club Name */}
      <h1 className="font-pixel text-3xl mb-4">{clubName}</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-pixel rounded ${
              activeTab === tab
                ? "bg-blue-400 text-purple-950"
                : "bg-purple-900 border border-blue-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      {renderActiveTab()}
    </div>
  );
}
