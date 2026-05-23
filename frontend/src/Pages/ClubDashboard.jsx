import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import Discussions from "../Components/Discussions";
import Events from "../Components/Events";
import Polls from "../Components/Polls";
import Documents from "../Components/Documents";
import ClubManagement from "../Components/ClubManagement";
import Sidebar from "../Components/Sidebar";
import { ArrowLeft } from "lucide-react";
import { API_BASE } from "../config";

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
    axios
      .get(`${API_BASE}/api/clubs/${clubId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setClub(res.data);
        setPermissions(res.data.permissions || []);
        setClubRole(res.data.clubRole);
      })
      .catch((err) => {
        if (err.response?.status === 403) navigate("/join-clubs");
      })
      .finally(() => setLoading(false));
  }, [clubId, token, navigate]);

  const can = (p) => permissions.includes(p);
  const tabs = can("view_analytics")
    ? ["Discussions", "Events", "Members", "Polls", "Documents", "Manage"]
    : ["Discussions", "Events", "Members", "Polls", "Documents"];

  const renderTab = () => {
    switch (activeTab) {
      case "Discussions":
        return <Discussions clubId={clubId} token={token} />;
      case "Events":
        return <Events clubId={clubId} token={token} canCreate={can("create_event")} canEdit={can("edit_event")} />;
      case "Members":
        return <MembersList clubId={clubId} token={token} canAssignRoles={can("assign_roles")} />;
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f5f3ff" }}>
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans flex" style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #faf5ff 50%, #f0f9ff 100%)" }}>
      <Sidebar role="user" />

      <div className="flex-1 flex flex-col ml-56">
        <nav
          className="sticky top-0 z-40 px-6 py-3 flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(124,58,237,0.10)",
          }}
        >
          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm" style={{ color: "#1E3A8A" }}>{club?.name}</span>
            {clubRole && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize bg-purple-100 text-purple-700">
                {clubRole.replace("_", " ")}
              </span>
            )}
          </div>
          <button
            onClick={() => navigate("/join-clubs")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 transition hover:bg-purple-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">All Clubs</span>
          </button>
        </nav>

        <div
          className="sticky z-30 px-6 border-b"
          style={{
            top: "53px",
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

        <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 pb-16">
          {renderTab()}
        </div>

        <footer className="py-6 text-center text-xs border-t" style={{ color: "rgba(107,114,128,0.6)", borderColor: "rgba(124,58,237,0.08)" }}>
          © 2025 EventSync
        </footer>
      </div>
    </div>
  );
}

function MembersList({ clubId, token, canAssignRoles }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/clubs/${clubId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [clubId]);

  const assignRole = async (memberId, role) => {
    try {
      await axios.patch(
        `${API_BASE}/api/clubs/${clubId}/members/${memberId}/role`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMembers();
    } catch {}
  };

  if (loading)
    return <div className="py-10 text-center text-sm text-gray-400">Loading members...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-2 mt-2">
      {members.length === 0 ? (
        <p className="text-center py-10 text-sm text-gray-400">No active members.</p>
      ) : (
        members.map((m) => (
          <div
            key={m._id}
            className="flex items-center justify-between p-4 rounded-xl bg-white border border-purple-100"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-purple-600 to-indigo-500">
                {m.userId?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">{m.userId?.name}</p>
                <p className="text-xs text-gray-400">{m.userId?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize bg-purple-100 text-purple-700">
                {m.role?.replace("_", " ")}
              </span>
              {canAssignRoles && (
                <select
                  defaultValue={m.role}
                  onChange={(e) => assignRole(m._id, e.target.value)}
                  className="text-xs rounded-lg px-2 py-1 outline-none bg-purple-50 border border-purple-200 text-gray-700"
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
