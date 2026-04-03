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
      .get(`http://localhost:5000/api/clubs/${clubId}`, {
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
        return (
          <Events
            clubId={clubId}
            token={token}
            canCreate={can("create_event")}
            canEdit={can("edit_event")}
          />
        );
      case "Members":
        return (
          <MembersList
            clubId={clubId}
            token={token}
            canAssignRoles={can("assign_roles")}
          />
        );
      case "Polls":
        return <Polls clubId={clubId} token={token} />;
      case "Documents":
        return <Documents clubId={clubId} token={token} />;
      case "Manage":
        return (
          <ClubManagement
            clubId={clubId}
            token={token}
            permissions={permissions}
            initialJoinPolicy={club?.joinPolicy}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg,#ede9fe,#f5f3ff,#e0e7ff)",
        }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: "#7C3AED", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans relative overflow-x-hidden"
      style={{
        background:
          "linear-gradient(135deg,#ede9fe 0%,#f5f3ff 40%,#e0e7ff 100%)",
      }}
    >
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(circle,#c4b5fd,transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 -right-40 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{
            background: "radial-gradient(circle,#a5b4fc,transparent 70%)",
          }}
        />
      </div>

      <nav
        className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between"
        style={{
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 1px 24px rgba(124,58,237,0.10)",
          borderBottom: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        <div className="flex items-center gap-4">
          <Logo />
          <div
            className="hidden sm:block w-px h-5"
            style={{ background: "rgba(124,58,237,0.2)" }}
          />
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="font-semibold text-sm"
              style={{ color: "#1E3A8A" }}
            >
              {club?.name}
            </span>
            {clubRole && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}
              >
                {clubRole.replace("_", " ")}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => navigate("/join-clubs")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition hover:bg-purple-50"
          style={{ color: "#6B7280" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Clubs</span>
        </button>
      </nav>

      <div className="relative z-10 pt-6 pb-2 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="sm:hidden mb-4 flex items-center gap-2">
            <span className="font-semibold" style={{ color: "#1E3A8A" }}>
              {club?.name}
            </span>
            {clubRole && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium capitalize"
                style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}
              >
                {clubRole.replace("_", " ")}
              </span>
            )}
          </div>
          <div
            className="inline-flex rounded-2xl p-1 gap-1 flex-wrap"
            style={{
              background: "rgba(255,255,255,0.65)",
              border: "1px solid rgba(124,58,237,0.12)",
              boxShadow: "0 2px 12px rgba(124,58,237,0.08)",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                style={
                  activeTab === tab
                    ? {
                        background: "linear-gradient(135deg,#1E3A8A,#7C3AED)",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
                      }
                    : { color: "#6B7280" }
                }
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

      <footer
        className="relative z-10 py-8 text-center text-xs border-t"
        style={{
          color: "rgba(107,114,128,0.6)",
          borderColor: "rgba(124,58,237,0.10)",
        }}
      >
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
      const res = await axios.get(
        `http://localhost:5000/api/clubs/${clubId}/members`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
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
        `http://localhost:5000/api/clubs/${clubId}/members/${memberId}/role`,
        { role },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchMembers();
    } catch {}
  };

  if (loading)
    return (
      <div className="py-10 text-center text-sm" style={{ color: "#9CA3AF" }}>
        Loading members...
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto space-y-3 mt-4">
      {members.length === 0 ? (
        <p className="text-center py-10 text-sm" style={{ color: "#9CA3AF" }}>
          No active members.
        </p>
      ) : (
        members.map((m) => (
          <div
            key={m._id}
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.75)",
              border: "1px solid rgba(124,58,237,0.12)",
              boxShadow: "0 2px 10px rgba(124,58,237,0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{
                  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                }}
              >
                {m.userId?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#1E3A8A" }}>
                  {m.userId?.name}
                </p>
                <p className="text-xs" style={{ color: "#9CA3AF" }}>
                  {m.userId?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}
              >
                {m.role?.replace("_", " ")}
              </span>
              {canAssignRoles && (
                <select
                  defaultValue={m.role}
                  onChange={(e) => assignRole(m._id, e.target.value)}
                  className="text-xs rounded-lg px-2 py-1 outline-none"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    color: "#374151",
                  }}
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
