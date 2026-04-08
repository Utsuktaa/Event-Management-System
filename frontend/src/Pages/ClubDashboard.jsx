import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { getTokenFromCookies } from "../Utils/auth";
import Discussions from "../Components/Discussions";
import Events from "../Components/Events";
import Polls from "../Components/Polls";
import Documents from "../Components/Documents";
import ClubManagement from "../Components/ClubManagement";
import Logo from "../Components/Logo";
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100">
        <div className="w-8 h-8 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans relative overflow-x-hidden bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl bg-violet-300" />
        <div className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl bg-indigo-300" />
      </div>

      <nav className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between bg-white/75 backdrop-blur-xl shadow-[0_1px_24px_rgba(124,58,237,0.10)] border-b border-purple-200/50">
        <div className="flex items-center gap-4">
          <Logo />
          <div className="hidden sm:block w-px h-5 bg-purple-200" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-semibold text-sm text-blue-900">{club?.name}</span>
            {clubRole && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize bg-purple-100 text-purple-700">
                {clubRole.replace("_", " ")}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate("/join-clubs")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-gray-500 transition hover:bg-purple-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Clubs</span>
        </button>
      </nav>

      <div className="relative z-10 pt-6 pb-2 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="sm:hidden mb-4 flex items-center gap-2">
            <span className="font-semibold text-blue-900">{club?.name}</span>
            {clubRole && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize bg-purple-100 text-purple-700">
                {clubRole.replace("_", " ")}
              </span>
            )}
          </div>
          <div className="inline-flex rounded-2xl p-1 gap-1 flex-wrap bg-purple-700/90 border border-purple-600 shadow-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-purple-700 shadow-sm"
                    : "text-purple-100 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-16 pt-4">
        {renderTab()}
      </div>

      <footer className="relative z-10 py-8 text-center text-xs border-t border-purple-200/50 text-gray-400">
        © 2025 EventSync
      </footer>
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
    <div className="max-w-2xl mx-auto space-y-3 mt-4">
      {members.length === 0 ? (
        <p className="text-center py-10 text-sm text-gray-400">No active members.</p>
      ) : (
        members.map((m) => (
          <div
            key={m._id}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/75 border border-purple-200/50 shadow-sm"
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
