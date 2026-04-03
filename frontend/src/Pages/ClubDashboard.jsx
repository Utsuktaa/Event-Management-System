import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import Discussions from "../Components/Discussions";
import Events from "../Components/Events";
import Polls from "../Components/Polls";
import Documents from "../Components/Documents";
import ClubManagement from "../Components/ClubManagement";

export default function ClubDashboard() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const token = getTokenFromCookies();

  const [club, setClub] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [clubRole, setClubRole] = useState(null);
  const [activeTab, setActiveTab] = useState("Discussions");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/clubs/${clubId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClub(res.data);
        setPermissions(res.data.permissions || []);
        setClubRole(res.data.clubRole);
      } catch (err) {
        if (err.response?.status === 403) {
          navigate("/join-clubs");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [clubId, token, navigate]);

  const can = (permission) => permissions.includes(permission);

  const baseTabs = ["Discussions", "Events", "Members", "Polls", "Documents"];
  const adminTabs = can("view_analytics") ? [...baseTabs, "Manage"] : baseTabs;

  const renderTab = () => {
    switch (activeTab) {
      case "Discussions":
        return <Discussions clubId={clubId} token={token} />;
      case "Events":
        return <Events clubId={clubId} token={token} canCreate={can("create_event")} canEdit={can("edit_event")} />;
      case "Members":
        return <MembersList clubId={clubId} token={token} canManage={can("manage_members")} canAssignRoles={can("assign_roles")} />;
      case "Polls":
        return <Polls clubId={clubId} token={token} />;
      case "Documents":
        return <Documents clubId={clubId} token={token} />;
      case "Manage":
        return <ClubManagement clubId={clubId} token={token} permissions={permissions} initialJoinPolicy={club?.joinPolicy} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-950 text-white">
      <div className="w-full bg-white py-6 flex items-center justify-center gap-3">
        <h1 className="text-center text-purple-900 font-pixel text-3xl">
          {club?.name || "Club"}
        </h1>
        {clubRole && (
          <span className="text-xs font-pixel text-purple-400 uppercase border border-purple-300 px-2 py-0.5 rounded-full">
            {clubRole.replace("_", " ")}
          </span>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <div className="bg-purple-900 rounded-full p-1 flex gap-1 flex-wrap justify-center">
          {adminTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full transition-all duration-300 text-sm ${
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

      <div className="mt-8 px-6 pb-16">{renderTab()}</div>
    </div>
  );
}

function MembersList({ clubId, token, canManage, canAssignRoles }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/clubs/${clubId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMembers(); }, [clubId]);

  const assignRole = async (memberId, role) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/clubs/${clubId}/members/${memberId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMembers();
    } catch {
      // silent
    }
  };

  if (loading) return <p className="text-center text-gray-400 py-10">Loading members...</p>;

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {members.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No active members.</p>
      ) : (
        members.map((m) => (
          <div key={m._id} className="flex items-center justify-between p-4 border border-blue-400 bg-purple-900 rounded-lg">
            <div>
              <p className="font-pixel">{m.userId?.name}</p>
              <p className="text-xs text-gray-400">{m.userId?.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-pixel text-blue-300 uppercase">{m.role?.replace("_", " ")}</span>
              {canAssignRoles && (
                <select
                  defaultValue={m.role}
                  onChange={(e) => assignRole(m._id, e.target.value)}
                  className="text-xs bg-purple-800 border border-blue-400 text-white rounded px-2 py-1"
                >
                  <option value="member">Member</option>
                  <option value="club_admin">Club Admin</option>
                  <option value="vice_president">Vice President</option>
                  <option value="president">President</option>
                </select>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
